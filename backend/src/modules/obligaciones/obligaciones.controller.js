const svc = require('./obligaciones.service');

// GET /api/obligaciones
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

// GET /api/obligaciones/:id
async function get(req, res, next) {
  try {
    const item = await svc.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (e) { next(e); }
}

// POST /api/obligaciones
async function create(req, res, next) {
  try {
    const body = req.body || {};
    const obligacion_contractual = body.obligacion_contractual ?? body.obligacion;
    if (!obligacion_contractual) return res.status(400).json({ error: 'obligacion_contractual es requerido' });
    const id = await svc.create({ obligacion_contractual }, req.user.id);
    res.status(201).json({ id_obligacion: id });
  } catch (e) { next(e); }
}

// PUT /api/obligaciones/:id
async function update(req, res, next) {
  try {
    const body = req.body || {};
    const obligacion_contractual = body.obligacion_contractual ?? body.obligacion;
    if (!obligacion_contractual) return res.status(400).json({ error: 'obligacion_contractual es requerido' });
    await svc.update(req.params.id, { obligacion_contractual }, req.user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// DELETE /api/obligaciones/:id
async function remove(req, res, next) {
  try {
    await svc.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// GET /api/obligaciones/:id/relaciones  → perfiles que la usan
async function relations(req, res, next) {
  try {
    const perfiles = await svc.getRelatedPerfiles(req.params.id);
    res.json({ perfiles });
  } catch (e) { next(e); }
}

module.exports = { list, get, create, update, remove, relations };
