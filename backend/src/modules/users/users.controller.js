const svc = require('./users.service');
async function list(req, res, next) {
  try { res.json(await svc.list({ q: req.query.q, page: req.query.page, pageSize: req.query.pageSize })); }
  catch (e) { next(e); }
}
module.exports = { list };
