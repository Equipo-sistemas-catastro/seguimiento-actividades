const { sign } = require('../../utils/jwt');
const svc = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email y password son requeridos' });

    const u = await svc.findUserForLogin(email, password);
    if (!u) return res.status(401).json({ error: 'Credenciales inválidas' });

    const payload = {
      id: u.id_user,
      email: u.email,
      id_role_user: u.id_role_user,
      name: u.name
    };
    const token = sign(payload);
    res.json({ token, user: payload });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const u = await svc.getUserById(req.user.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: u.id_user, email: u.email, id_role_user: u.id_role_user, name: u.name });
  } catch (e) { next(e); }
}

module.exports = { login, me };
