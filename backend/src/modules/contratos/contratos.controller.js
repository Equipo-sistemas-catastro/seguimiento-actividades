// backend/src/modules/contratos/contratos.controller.js
const svc = require('./contratos.service');

// GET /api/contratos?q=&page=&pageSize=
async function list(req, res, next) {
  try {
    const data = await svc.list({
      q: req.query.q,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.json(data);
  } catch (e) { next(e); }
}

// GET /api/contratos/:id
async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const row = await svc.getById(id);
    if (!row) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(row);
  } catch (e) { next(e); }
}

// POST /api/contratos
async function create(req, res, next) {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || null; // auditoría
    const id = await svc.create(payload, userId);
    res.json({ id_contrato: id });
  } catch (e) { next(e); }
}

// PUT /api/contratos/:id
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const payload = req.body || {};
    const userId = req.user?.id || null; // auditoría
    await svc.update(id, payload, userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// GET /api/contratos/catalogos/tipos-contrato
async function listTiposContrato(req, res, next) {
  try {
    const rows = await svc.listTiposContrato();
    res.json(rows);
  } catch (e) { next(e); }
}

// GET /api/contratos/catalogos/entidades
async function listEntidades(req, res, next) {
  try {
    const rows = await svc.listEntidades();
    res.json(rows);
  } catch (e) { next(e); }
}

module.exports = {
  list,
  get,
  create,
  update,
  listTiposContrato,
  listEntidades,
};
