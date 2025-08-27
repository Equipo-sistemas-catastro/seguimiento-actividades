const { pool } = require('../../config/db');
const Q = require('./auth.queries');

async function findUserForLogin(email, password) {
  const { rows } = await pool.query(Q.findUserForLogin(email, password));
  return rows[0] || null;
}

async function getUserById(id) {
  const { rows } = await pool.query(Q.getUserById(id));
  return rows[0] || null;
}

module.exports = { findUserForLogin, getUserById };
