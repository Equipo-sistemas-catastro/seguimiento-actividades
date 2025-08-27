const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./obligaciones.controller');

// Rutas de Obligaciones: JWT + permiso 'OBLIGACIONES'
r.use(requireAuth, authorize('OBLIGACIONES'));

// ⚠️ Rutas específicas primero
r.get('/:id/relaciones', c.relations);

r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;
