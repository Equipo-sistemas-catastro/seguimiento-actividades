const svc = require('./perfiles.service');

// GET /api/perfiles
async function list(req, res, next) {
  try {
    const data = await svc.list({
      q: req.query.q,
      page: req.query.page,
      pageSize: req.query.pageSize
    });
    // Puedes responder array o {items,total,...}; dejamos estándar del repo:
    res.json(data);
  } catch (e) { next(e); }
}

// GET /api/perfiles/:id  -> devuelve perfil + obligaciones
async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    const item = await svc.getByIdFull(id);
    if (!item) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(item);
  } catch (e) { next(e); }
}

// POST /api/perfiles
async function create(req, res, next) {
  try {
    const { perfil, descripcion } = req.body || {};
    if (!perfil) return res.status(400).json({ error: 'perfil es requerido' });

    const userId = req.user?.id || null; // auditoría
    const id = await svc.create({ perfil, descripcion }, userId);
    res.json({ id_perfil: id });
  } catch (e) { next(e); }
}

// PUT /api/perfiles/:id
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { perfil, descripcion } = req.body || {};
    if (!perfil) return res.status(400).json({ error: 'perfil es requerido' });

    const userId = req.user?.id || null;
    await svc.update(id, { perfil, descripcion }, userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// PUT /api/perfiles/:id/asignaciones
// Body esperado: { obligacionesIds: number[], usuariosIds?: [] }  ← usuariosIds se ignora si viene vacío
async function updateAssignments(req, res, next) {
  try {
    const idPerfil = Number(req.params.id);
    const { obligacionesIds = [], usuariosIds = [] } = req.body || {};
    const userId = req.user?.id || null;

    await svc.updateAssignments(idPerfil, { obligacionesIds, usuariosIds }, userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// DELETE /api/perfiles/:id
async function remove(req, res, next) {
  try {
    await svc.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { list, get, create, update, updateAssignments, remove };
