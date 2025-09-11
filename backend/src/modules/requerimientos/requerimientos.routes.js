// backend/src/modules/requerimientos/requerimientos.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./requerimientos.controller');

// Todas las rutas requieren autenticación
r.use(requireAuth);

// --- Catálogos ---
r.get('/catalogos/estados', c.listEstados);

// --- CRUD protegido por menú REQUERIMIENTOS ---
r.use(authorize('REQUERIMIENTOS'));

r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', c.create);
r.put('/:id', c.update);

module.exports = r;
