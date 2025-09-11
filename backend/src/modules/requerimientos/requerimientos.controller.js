// backend/src/modules/requerimientos/requerimientos.controller.js
const svc = require('./requerimientos.service');

// GET /api/requerimientos?q=&estado=&page=&pageSize=
async function list(req, res, next) {
  try {
    const data = await svc.list({
      q: req.query.q,
      estado: req.query.estado,
      page: req.query.page,
      pageSize: req.query.pageSize,
    }, req.user?.id);
    res.json(data);
  } catch (e) { next(e); }
}

// GET /api/requerimientos/:id
async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const row = await svc.getById(id);
    if (!row) return res.status(404).json({ error: 'Requerimiento no encontrado' });
    res.json(row);
  } catch (e) { next(e); }
}

// POST /api/requerimientos
async function create(req, res, next) {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || null;
    const id = await svc.create(payload, userId);
    res.json({ id_req: id });
  } catch (e) { next(e); }
}

// PUT /api/requerimientos/:id
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const payload = req.body || {};
    const userId = req.user?.id || null;
    await svc.update(id, payload, userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// GET /api/requerimientos/catalogos/estados
async function listEstados(req, res, next) {
  try {
    const rows = await svc.listEstados();
    res.json(rows);
  } catch (e) { next(e); }
}

module.exports = {
  list,
  get,
  create,
  update,
  listEstados,
};
