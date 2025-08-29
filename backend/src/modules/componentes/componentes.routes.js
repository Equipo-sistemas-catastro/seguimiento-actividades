// backend/src/modules/componentes/componentes.routes.js
const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./componentes.controller');

// Todas las rutas de Componentes requieren JWT y permiso de menú 'COMPONENTES'
r.use(requireAuth, authorize('COMPONENTES'));

// Paso 1: solo listado
r.get('/', c.list);

// (en pasos siguientes agregamos: GET/:id, POST, PUT)
module.exports = r;
