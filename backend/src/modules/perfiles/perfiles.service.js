const { pool } = require('../../config/db');
const XLSX = require('xlsx');
const Q = require('./perfiles.queries');

// Listado (paginado + búsqueda)
async function list({ q, page, pageSize }) {
  const built = Q.list(q, page, pageSize);
  const [rowsRes, countRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count)
  ]);
  return {
    items: rowsRes.rows.map(r => ({
      id: r.id_perfil,
      perfil: r.perfil,
      descripcion: r.descripcion
    })),
    total: countRes.rows[0].total,
    page: built.page,
    pageSize: built.pageSize
  };
}

// Detalle con obligaciones relacionadas
async function getByIdFull(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pRes = await client.query(Q.getById(id));
    if (pRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const p = pRes.rows[0];

    const oblRes = await client.query(Q.getObligacionesByPerfil(id));

    await client.query('COMMIT');

    return {
      id_perfil: p.id_perfil,
      perfil: p.perfil,
      descripcion: p.descripcion,
      obligaciones: oblRes.rows.map(o => ({
        id_obligacion: o.id_obligacion,
        obligacion_contractual: o.obligacion
      }))
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Crear perfil
async function create({ perfil, descripcion = '' }, userId = null) {
  const { rows } = await pool.query(Q.insert({ perfil, descripcion, userId }));
  const id = rows?.[0]?.id_perfil;
  if (!id) {
    const err = new Error('No se pudo obtener id_perfil al crear');
    err.status = 500;
    throw err;
  }
  return id;
}

// Actualizar perfil
async function update(id, { perfil, descripcion = '' }, userId = null) {
  const r = await pool.query(Q.update(id, { perfil, descripcion, userId }));
  if (r.rowCount === 0) {
    const err = new Error('Perfil no encontrado');
    err.status = 404;
    throw err;
  }
  return true;
}

// Eliminar perfil
async function remove(id) {
  try {
    await pool.query(Q.remove(id));
  } catch (e) {
    if (e.code === '23503') { // FK referenciada
      e.status = 409;
      e.message = 'No se puede eliminar: el perfil está referenciado.';
    }
    throw e;
  }
}

// Reemplaza asignaciones de obligaciones (y opcionalmente usuarios)
async function updateAssignments(idPerfil, { obligacionesIds = [], usuariosIds = [] }, userId = null) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');

    // Limpiar relaciones previas de obligaciones
    await c.query(Q.deleteObligacionesByPerfil(idPerfil));

    // Insertar nuevas obligaciones (si hay)
    if (Array.isArray(obligacionesIds) && obligacionesIds.length > 0) {
      for (const idObl of obligacionesIds) {
        await c.query(Q.insertPerfilObligacion(idPerfil, idObl, userId));
      }
    }

    // Usuarios: solo si realmente viene algo; si no, NO tocamos usuarios
    if (Array.isArray(usuariosIds) && usuariosIds.length > 0) {
      const clearQ = Q.clearUsersByPerfil?.(idPerfil);
      const assignQ = Q.assignUsersToPerfil?.(idPerfil, usuariosIds);
      if (clearQ) await c.query(clearQ);
      if (assignQ) await c.query(assignQ);
    }

    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}

/* ========= IMPORTACIÓN EXCEL =========
   Ajustado: NO importa el nombre del encabezado.
   - Se toma la PRIMERA FILA como encabezado.
   - Se lee la PRIMERA COLUMNA (columna A) desde la fila 2 hacia abajo.
*/
function leerObligacionesDesdeExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  if (!wb.SheetNames.length) {
    const err = new Error('El Excel no tiene hojas.');
    err.status = 400;
    throw err;
  }
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
  if (!rows.length) {
    const err = new Error('El Excel está vacío.');
    err.status = 400;
    throw err;
  }

  // Tomamos SIEMPRE la primera columna. La primera fila es encabezado.
  const set = new Set();
  for (let i = 1; i < rows.length; i++) {
    const val = rows[i]?.[0]; // columna A
    const txt = String(val ?? '').trim();
    if (txt) set.add(txt);
    if (set.size > 5000) break; // cota de seguridad
  }
  return Array.from(set);
}

// Crea si no existe (comparando por LOWER(TRIM(...)))
async function getOrCreateObligacion(c, obligacion, userId = null) {
  const sel = await c.query(Q.findObligacionByText(obligacion));
  if (sel.rows.length) return { id: sel.rows[0].id_obligacion, created: false };
  const ins = await c.query(Q.insertObligacion(obligacion, userId));
  return { id: ins.rows[0].id_obligacion, created: true };
}

// Importar y reemplazar relaciones de un perfil desde Excel
async function importObligacionesFromExcel(idPerfil, fileBuffer, userId = null) {
  const obligacionesTxt = leerObligacionesDesdeExcel(fileBuffer);
  const c = await pool.connect();
  let relacionesEliminadas = 0;
  let obligacionesCreadas = 0;
  let relacionesCreadas = 0;

  try {
    await c.query('BEGIN');

    // Eliminar relaciones existentes
    const delRes = await c.query(Q.deleteObligacionesByPerfil(idPerfil));
    relacionesEliminadas = delRes.rowCount || 0;

    // Si no hay ninguna en el Excel, solo limpiar y salir
    if (obligacionesTxt.length === 0) {
      await c.query('COMMIT');
      return {
        ok: true,
        relacionesEliminadas,
        obligacionesCreadas,
        relacionesCreadas
      };
    }

    // Crear/obtener IDs y relacionar
    for (const txt of obligacionesTxt) {
      const { id, created } = await getOrCreateObligacion(c, txt, userId);
      if (created) obligacionesCreadas += 1;
      await c.query(Q.insertPerfilObligacion(idPerfil, id, userId));
      relacionesCreadas += 1;
    }

    await c.query('COMMIT');
    return {
      ok: true,
      relacionesEliminadas,
      obligacionesCreadas,
      relacionesCreadas
    };
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}

module.exports = {
  list,
  getByIdFull,
  create,
  update,
  remove,
  updateAssignments,
  importObligacionesFromExcel
};
