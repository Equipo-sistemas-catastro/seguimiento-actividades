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
    const items = await svc.listMisObligaciones(userId);
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

// GET /api/actividades/mis (?id_req=123 opcional)
// Si viene id_req: lista actividades del empleado para ese requerimiento.
// Si NO viene id_req: retorna el Kanban de "Mis actividades" con las reglas pedidas.
async function listMisActividades(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id_req =
      req.query.id_req !== undefined
        ? req.query.id_req
        : (req.query.idReq !== undefined ? req.query.idReq : undefined);

    const items = await svc.listMisActividades(userId, id_req);
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

// GET /api/actividades/:id
async function getActividadById(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      const err = new Error('El id de la actividad debe ser numérico');
      err.status = 400; throw err;
    }
    const row = await svc.getActividadById(userId, id);
    if (!row) {
      const err = new Error('Actividad no encontrada');
      err.status = 404; throw err;
    }
    res.json({ ok: true, item: row });
  } catch (e) {
    next(e);
  }
}

// PUT /api/actividades/:id
// Reglas de negocio (finalización, bloqueos, validaciones) están en el service.
async function updateActividad(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const id_actividad = Number(req.params.id);
    if (!Number.isFinite(id_actividad)) {
      const err = new Error('El id de la actividad debe ser numérico');
      err.status = 400; throw err;
    }
    const body = req.body || {};
    const out = await svc.updateActividad(userId, id_actividad, body);
    res.json({ ok: true, id_actividad: out.id_actividad });
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
