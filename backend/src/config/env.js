require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5012,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3012',
  db: {
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE || 'Catastro',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    searchPath: process.env.PG_SEARCH_PATH || 'dev'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mi_secreto_super_seguro',
    expiresIn: process.env.JWT_EXPIRES_IN || '3h'
  },
  // ⬇️ nuevo: controla si exponemos /api/auth/login
  authMode: (process.env.AUTH_MODE || 'local').toLowerCase() // 'local' | 'external'
};
