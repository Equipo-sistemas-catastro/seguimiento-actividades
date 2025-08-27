const { pool } = require('../../config/db');
const Q = require('./perfiles.queries');

// Listado
async function list({ q, page, pageSize }) {
  const built = Q.list(q, page, pageSize);
  const [rowsRes, countRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count)
  ]);
  return { items: rowsRes.rows, total: countRes.rows[0].total, page: built.page, pageSize: built.pageSize };
}

// Detalle con asignaciones
async function getByIdFull(id) {
  const [p, o, u] = await Promise.all([
    pool.query(Q.getPerfilById(id)),
    pool.query(Q.getObligacionesByPerfil(id)),
    pool.query(Q.getUsersByPerfil(id))
  ]);
  if (!p.rows[0]) return null;
  return {
    perfil: p.rows[0],
    obligaciones: o.rows.map(r => r.id_obligacion),
    usuarios: u.rows // {id_user, name, email}
  };
}

// Crear básico
async function create({ perfil, descripcion_perfil }, userId) {
  const { rows } = await pool.query(Q.insert(perfil, descripcion_perfil, userId));
  return rows[0].id_perfil;
}

// Actualizar básico
async function update(id, { perfil, descripcion_perfil }, userId) {
  await pool.query(Q.update(id, perfil, descripcion_perfil, userId));
}

// Eliminar
async function remove(id) {
  try {
    await pool.query(Q.remove(id));
  } catch (e) {
    if (e.code === '23503') {
      e.status = 409;
      e.message = 'No se puede eliminar: el perfil está referenciado.';
    }
    throw e;
  }
}

// Reemplazar asignaciones (obligaciones + usuarios) en transacción
async function updateAssignments(idPerfil, { obligacionesIds = [], usuariosIds = [] }, userId) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');

    // Obligaciones: borrar todas e insertar las nuevas
    await c.query(Q.deletePerfilObligaciones(idPerfil));
    const bulkOb = Q.bulkInsertPerfilObligaciones(idPerfil, obligacionesIds, userId);
    if (bulkOb) await c.query(bulkOb);

    // Usuarios: si viene lista, se limpia a todos excepto esa lista, y se asigna a esa lista
    if (usuariosIds.length) {
      const clearExcept = Q.clearUsersExcept(idPerfil, usuariosIds);
      if (clearExcept) await c.query(clearExcept);
      const assign = Q.assignUsersToPerfil(idPerfil, usuariosIds);
      if (assign) await c.query(assign);
    } else {
      // lista vacía -> limpiar todos los usuarios que tenían ese perfil
      await c.query(Q.clearUsersByPerfil(idPerfil));
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
