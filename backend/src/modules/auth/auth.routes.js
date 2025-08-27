const r = require('express').Router();
const c = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth');
const env = require('../../config/env');

// Exponemos /login SOLO en modo 'local' (simulación)
if (env.authMode === 'local') {
  r.post('/login', c.login);
}

// /me SIEMPRE disponible (requiere token válido, venga de donde venga)
r.get('/me', requireAuth, c.me);

module.exports = r;
