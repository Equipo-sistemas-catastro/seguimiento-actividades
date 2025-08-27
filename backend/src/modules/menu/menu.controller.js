// backend/src/modules/menu/menu.controller.js
const svc = require('./menu.service');

async function myMenu(req, res, next) {
  try {
    const items = await svc.getMenusByRole(req.user.id_role_user);
    res.json({ items });
  } catch (e) { next(e); }
}

module.exports = { myMenu };
