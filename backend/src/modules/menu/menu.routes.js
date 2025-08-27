const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const c = require('./menu.controller');

// requiere solo estar autenticado
r.get('/my', requireAuth, c.myMenu);

module.exports = r;
