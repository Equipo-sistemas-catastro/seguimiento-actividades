// backend/src/routes.js
const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/menu', require('./modules/menu/menu.routes'));
router.use('/perfiles', require('./modules/perfiles/perfiles.routes'));
router.use('/obligaciones', require('./modules/obligaciones/obligaciones.routes'));
router.use('/empleados', require('./modules/empleados/empleados.routes')); // ya existente
router.use('/componentes', require('./modules/componentes/componentes.routes')); // ⬅️ existente
router.use('/contratos', require('./modules/contratos/contratos.routes')); // ⬅️ nuevo
router.use('/requerimientos', require('./modules/requerimientos/requerimientos.routes')); // ⬅️ nuevo
router.use('/mis-requerimientos', require('./modules/mis-requerimientos/mis-requerimientos.routes')); // solo asignados
router.use('/actividades', require('./modules/actividades/actividades.routes')); // ⬅️ actividades

// ⬇️ NUEVO: informe de actividades
router.use('/informe-actividades', require('./modules/informe-actividades/informe.routes'));
// ⬇️ NUEVO: Ver Informes (por empleado/año/mes)
router.use('/ver-informes', require('./modules/ver-informes/ver-informes.routes'));

module.exports = router;
