const { pool } = require('../../config/db');
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
// ⚠️ En este flujo SOLO procesamos obligaciones; los usuarios se ignoran si el array viene vacío
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
      // Solo ejecuta si esas funciones existen en queries y devuelven objeto
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

module.exports = { list, getByIdFull, create, update, remove, updateAssignments };
