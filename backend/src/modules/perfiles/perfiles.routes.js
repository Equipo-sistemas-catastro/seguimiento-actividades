const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./perfiles.controller');

// Todas las rutas de Perfiles protegidas por JWT y permiso 'PERFILES'
r.use(requireAuth, authorize('PERFILES'));

// Rutas (orden importa: específicas primero)
r.put('/:id/asignaciones', c.updateAssignments);

r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;
