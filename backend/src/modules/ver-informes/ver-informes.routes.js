// backend/src/modules/ver-informes/ver-informes.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./ver-informes.controller');

// Todas requieren auth + permiso de menú VER_INFORMES (roles 1 y 2 en BD para pruebas)
router.use(requireAuth);
router.use(authorize('VER_INFORMES'));

// Catálogos
router.get('/catalogos/empleados', c.buscarEmpleados);            // ?search=...
router.get('/catalogos/anios/:id_empleado', c.listAniosDisponibles);
router.get('/catalogos/meses/:id_empleado/:anio', c.listMesesDisponibles);

// Datos del informe (mismo contenido que "Informe Actividades" pero por empleado/año/mes)
router.get('/generar', c.generarInformeActividades);               // ?id_empleado=&anio=&mes=

// PDF (HTML → PDF con hipervínculos, reusa renderer del módulo Informe Actividades)
router.post('/pdf', c.generarPdfInforme);

module.exports = router;
