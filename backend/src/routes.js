const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/menu', require('./modules/menu/menu.routes'));

router.use('/perfiles', require('./modules/perfiles/perfiles.routes'));
router.use('/obligaciones', require('./modules/obligaciones/obligaciones.routes')); // ⬅️ NUEVO

module.exports = router;
