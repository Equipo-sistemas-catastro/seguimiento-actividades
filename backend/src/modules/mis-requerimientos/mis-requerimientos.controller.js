// backend/src/modules/mis-requerimientos/mis-requerimientos.controller.js
const svc = require('./mis-requerimientos.service');

// GET /api/mis-requerimientos?q=&estado=&page=&pageSize=
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

// GET /api/mis-requerimientos/:id
async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const row = await svc.getById(id, req.user?.id);
    if (!row) return res.status(404).json({ error: 'Requerimiento no encontrado o no asignado' });
    res.json(row);
  } catch (e) { next(e); }
}

// GET /api/mis-requerimientos/catalogos/estados
async function listEstados(_req, res, next) {
  try {
    const rows = await svc.listEstados();
    res.json(rows);
  } catch (e) { next(e); }
}

module.exports = { list, get, listEstados };
