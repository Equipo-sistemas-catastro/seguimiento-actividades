const { pool } = require('../../config/db');
const Q = require('./obligaciones.queries');

async function list({ q, page, pageSize }) {
  const built = Q.list(q, page, pageSize);
  const [rowsRes, cntRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count)
  ]);
  return {
    items: rowsRes.rows,
    total: cntRes.rows[0].total,
    page: built.page,
    pageSize: built.pageSize
  };
}

async function getById(id) {
  const { rows } = await pool.query(Q.getById(id));
  return rows[0] || null;
}

async function create({ obligacion_contractual }, userId) {
  const { rows } = await pool.query(Q.insert(obligacion_contractual, userId));
  return rows[0].id_obligacion;
}

async function update(id, { obligacion_contractual }, userId) {
  await pool.query(Q.update(id, obligacion_contractual, userId));
}

async function remove(id) {
  try {
    await pool.query(Q.remove(id));
  } catch (e) {
    if (e.code === '23503') { // FK referenciada sin CASCADE en algún lado
      e.status = 409;
      e.message = 'No se puede eliminar: obligación referenciada en otros registros.';
    }
    throw e;
  }
}

async function getRelatedPerfiles(idObligacion) {
  const { rows } = await pool.query(Q.perfilesByObligacion(idObligacion));
  return rows; // [{id_perfil, perfil}]
}

module.exports = { list, getById, create, update, remove, getRelatedPerfiles };
