const svc = require('./perfiles.service');

// GET /api/perfiles
async function list(req, res, next) {
  try {
    const data = await svc.list({
      q: req.query.q,
      page: req.query.page,
      pageSize: req.query.pageSize
    });
    res.json(data);
  } catch (e) { next(e); }
}

// GET /api/perfiles/:id  -> ahora devuelve perfil + obligaciones + usuarios
async function get(req, res, next) {
  try {
    const data = await svc.getByIdFull(req.params.id);
    if (!data) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(data);
  } catch (e) { next(e); }
}

// POST /api/perfiles
async function create(req, res, next) {
  try {
    const { perfil, descripcion_perfil } = req.body || {};
    if (!perfil) return res.status(400).json({ error: 'perfil es requerido' });
    const id = await svc.create({ perfil, descripcion_perfil }, req.user.id);
    res.status(201).json({ id_perfil: id });
  } catch (e) { next(e); }
}

// PUT /api/perfiles/:id  (solo datos base)
async function update(req, res, next) {
  try {
    const { perfil, descripcion_perfil } = req.body || {};
    if (!perfil) return res.status(400).json({ error: 'perfil es requerido' });
    await svc.update(req.params.id, { perfil, descripcion_perfil }, req.user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// PUT /api/perfiles/:id/asignaciones  (obligacionesIds[], usuariosIds[])
async function updateAssignments(req, res, next) {
  try {
    const { obligacionesIds, usuariosIds } = req.body || {};
    await svc.updateAssignments(
      req.params.id,
      {
        obligacionesIds: Array.isArray(obligacionesIds) ? obligacionesIds : [],
        usuariosIds: Array.isArray(usuariosIds) ? usuariosIds : []
      },
      req.user.id
    );
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
