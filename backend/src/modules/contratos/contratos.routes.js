// backend/src/modules/contratos/contratos.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./contratos.controller');

// Todas las rutas requieren estar autenticado
r.use(requireAuth);

// --- Catálogos: solo autenticación (NO requieren authorize('CONTRATOS')) ---
r.get('/catalogos/tipos-contrato', c.listTiposContrato);
r.get('/catalogos/entidades', c.listEntidades);

// --- CRUD protegido por menú/permiso CONTRATOS ---
r.use(authorize('CONTRATOS')); // a partir de aquí sí requiere permiso

r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', c.create);
r.put('/:id', c.update);

module.exports = r;
