const { pool } = require('../../config/db');
const Q = require('./users.queries');

async function list({ q, page, pageSize }) {
  const built = Q.list(q, page, pageSize);
  const [rowsRes, cntRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count)
  ]);
  return { items: rowsRes.rows, total: cntRes.rows[0].total, page: built.page, pageSize: built.pageSize };
}

module.exports = { list };
