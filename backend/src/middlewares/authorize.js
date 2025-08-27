const { pool } = require('../config/db');
const Q = require('../modules/menu/menu.queries');

/**
 * authorize('PERFILES') verifica que el rol del token tenga permiso
 * sobre el menú cuyo code = 'PERFILES' en la BD.
 * Úsese DESPUÉS de requireAuth.
 */
function authorize(menuCode) {
  if (!menuCode || typeof menuCode !== 'string') {
    throw new Error('authorize(menuCode) requiere un código de menú válido');
  }
  return async function (req, res, next) {
    try {
      const roleId = req.user?.id_role_user;
      if (!roleId) return res.status(401).json({ error: 'Token inválido: falta id_role_user' });

      const { rows } = await pool.query(Q.hasAccessToCode(roleId, menuCode));
      if (!rows[0]) return res.status(403).json({ error: `Sin permiso para ${menuCode}` });

      next();
    } catch (e) { next(e); }
  };
}

module.exports = { authorize };
