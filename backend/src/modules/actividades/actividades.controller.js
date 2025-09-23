// backend/src/modules/actividades/actividades.controller.js
const svc = require('./actividades.service');

// POST /api/actividades
async function create(req, res, next) {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || null;
    const out = await svc.create(payload, userId);
    res.json({ ok: true, ...out });
  } catch (e) {
    next(e);
  }
}

// GET /api/actividades/catalogos/mis-obligaciones
async function listMisObligaciones(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const rows = await svc.listMisObligaciones(userId);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

// ===== NUEVOS =====

// GET /api/actividades/mis?id_req=123
async function listMisActividades(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id_req = Number(req.query?.id_req);
    if (!id_req) return res.status(400).json({ error: 'id_req es obligatorio' });
    const rows = await svc.listMisActividades(userId, id_req);
    // Devuelvo un array simple (el frontend soporta array o {items})
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

// GET /api/actividades/:id
async function getActividadById(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id_actividad = Number(req.params.id);
    const row = await svc.getActividadById(userId, id_actividad);
    if (!row) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

// PUT /api/actividades/:id
async function updateActividad(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id_actividad = Number(req.params.id);
    const body = req.body || {};
    await svc.updateActividad(userId, id_actividad, body);
    res.json({ ok: true, id_actividad });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  listMisObligaciones,
  // nuevos
  listMisActividades,
  getActividadById,
  updateActividad,
};
