// backend/src/modules/actividades/actividades.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./actividades.controller');

// Todas las rutas requieren autenticación (mismo patrón que requerimientos)
r.use(requireAuth);

// --- Catálogos (sin authorize, alineado a /requerimientos/catalogos/estados) ---
r.get('/catalogos/mis-obligaciones', c.listMisObligaciones);

// ---- Subrouter con TODOS los endpoints protegidos ----
const secured = require('express').Router();

// Crear actividad
secured.post('/', c.create);

// Lista actividades del empleado logueado
// - Si viene ?id_req=<> -> lista por requerimiento
// - Si NO viene -> Kanban "Mis actividades"
secured.get('/mis', c.listMisActividades);

// Detalle de una actividad
secured.get('/:id', c.getActividadById);

// Actualizar una actividad
secured.put('/:id', c.updateActividad);

// Montamos el MISMO subrouter con dos autorizaciones diferentes (OR lógico por duplicidad)
r.use(authorize('MIS_ACTIVIDADES'), secured);
r.use(authorize('MIS_REQUERIMIENTOS'), secured);

module.exports = r;
