const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password
});

pool.on('connect', async (client) => {
  // dejamos el search_path listo para cuando usemos la BD
  await client.query(`SET search_path TO ${env.db.searchPath};`);
});

module.exports = { pool };
