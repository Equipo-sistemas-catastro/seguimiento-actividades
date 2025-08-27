const { pool } = require('../../config/db');
const Q = require('./menu.queries');

async function getMenusByRole(idRole) {
  const { rows } = await pool.query(Q.getMenusByRole(idRole));
  return rows;
}

module.exports = { getMenusByRole };
