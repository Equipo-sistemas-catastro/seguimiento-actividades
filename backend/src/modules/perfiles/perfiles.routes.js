const r = require('express').Router();
const multer = require('multer');
const { requireAuth } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const c = require('./perfiles.controller');

// Carga en memoria (máx 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Todas las rutas de Perfiles protegidas por JWT y permiso 'PERFILES'
r.use(requireAuth, authorize('PERFILES'));

// Nueva: importar obligaciones desde Excel para un perfil
// multipart/form-data con campo 'file'
r.post('/:id/obligaciones-excel', upload.single('file'), c.importObligExcel);

// Rutas (orden importa: específicas primero)
r.put('/:id/asignaciones', c.updateAssignments);

r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;
