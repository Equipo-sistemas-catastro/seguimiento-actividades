const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./empleados.controller');

// Protegido igual que Perfiles (código de menú: EMPLEADOS)
r.use(requireAuth, authorize('EMPLEADOS'));

// === Catálogos propios del módulo Empleados ===
r.get('/catalogos/perfiles', c.catalogPerfiles);
r.get('/catalogos/componentes', c.catalogComponentes);

// Listado / Crear / Detalle / Editar / Asignaciones
r.get('/', c.list);
r.post('/', c.create);
r.get('/:id', c.detail);
r.put('/:id', c.update);
r.put('/:id/perfil', c.putPerfil);
r.put('/:id/componente', c.putComponente);

module.exports = r;
