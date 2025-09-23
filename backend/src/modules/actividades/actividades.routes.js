// backend/src/modules/actividades/actividades.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./actividades.controller');

// Todas las rutas requieren autenticación (mismo patrón que requerimientos)
r.use(requireAuth);

// --- Catálogos (sin authorize, alineado a /requerimientos/catalogos/estados) ---
r.get('/catalogos/mis-obligaciones', c.listMisObligaciones);

// --- Acciones protegidas por menú MIS_REQUERIMIENTOS ---
r.use(authorize('MIS_REQUERIMIENTOS'));

// Crear actividad (para requerimiento asignado y no finalizado)
r.post('/', c.create);

// ===== NUEVO =====
// Lista actividades del empleado logueado para un requerimiento
// GET /api/actividades/mis?id_req=123
r.get('/mis', c.listMisActividades);

// Detalle de una actividad (restringido al empleado)
r.get('/:id', c.getActividadById);

// Actualizar una actividad (solo básicos: desc, fechas, estado)
r.put('/:id', c.updateActividad);

module.exports = r;
