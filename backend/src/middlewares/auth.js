const { verify } = require('../utils/jwt');

function extractToken(req) {
  const h = req.headers['authorization'] || '';
  const [type, token] = h.split(' ');
  return type === 'Bearer' ? token : null;
}

function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    req.user = verify(token);
    next();
  } catch { return res.status(401).json({ error: 'Token inválido o expirado' }); }
}

module.exports = { requireAuth };
