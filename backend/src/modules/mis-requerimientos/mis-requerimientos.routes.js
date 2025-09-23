// backend/src/modules/mis-requerimientos/mis-requerimientos.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./mis-requerimientos.controller');

// Todas las rutas requieren autenticación
r.use(requireAuth);

// Catálogos (los puede consultar quien tenga este menú)
r.get('/catalogos/estados', c.listEstados);

// Solo usuarios con el menú MIS_REQUERIMIENTOS
r.use(authorize('MIS_REQUERIMIENTOS'));

// Listado y detalle (sin crear/editar)
r.get('/', c.list);
r.get('/:id', c.get);

module.exports = r;
