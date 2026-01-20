// Todas las consultas del módulo Perfiles

// Listado con búsqueda y paginación
function list(q, page, pageSize) {
  page = Number(page) || 1;
  pageSize = Math.min(Number(pageSize) || 10, 100);
  const off = (page - 1) * pageSize;

  const values = [];
  let where = 'WHERE 1=1';
  if (q) {
    values.push(`%${q}%`);
    // descripcion_perfil en BD; lo exponemos como 'descripcion'
    where += ` AND (TRIM(perfil) ILIKE $${values.length} OR TRIM(descripcion_perfil) ILIKE $${values.length})`;
  }

  return {
    data: {
      name: 'perfil_list',
      text: `
        SELECT
          id_perfil,
          TRIM(perfil) AS perfil,
          TRIM(descripcion_perfil) AS descripcion
        FROM tbl_perfiles
        ${where}
        ORDER BY id_perfil ASC
        LIMIT ${pageSize} OFFSET ${off};`,
      values
    },
    count: {
      name: 'perfil_count',
      text: `SELECT COUNT(*)::int AS total FROM tbl_perfiles ${where};`,
      values
    },
    page, pageSize
  };
}

// Detalle por ID
function getById(id) {
  return {
    name: 'perfil_get',
    text: `
      SELECT
        id_perfil,
        TRIM(perfil) AS perfil,
        TRIM(descripcion_perfil) AS descripcion
      FROM tbl_perfiles
      WHERE id_perfil = $1;`,
    values: [id]
  };
}

// Obligaciones relacionadas a un perfil
function getObligacionesByPerfil(idPerfil) {
  return {
    name: 'perfil_oblig_list',
    text: `
      SELECT o.id_obligacion, TRIM(o.obligacion_contractual) AS obligacion
      FROM tbl_perfil_obligaciones po
      JOIN tbl_obligacion_contractual o ON o.id_obligacion = po.id_obligacion
      WHERE po.id_perfil = $1
      ORDER BY o.id_obligacion ASC;`,
    values: [idPerfil]
  };
}

// Insertar perfil
function insert({ perfil, descripcion = '', userId = null }) {
  return {
    name: 'perfil_insert',
    text: `
      INSERT INTO tbl_perfiles (perfil, descripcion_perfil, id_user_auditoria, fecha_auditoria)
      VALUES ($1, $2, $3, NOW())
      RETURNING id_perfil;`,
    values: [perfil, descripcion, userId]
  };
}

// Actualizar perfil
function update(id, { perfil, descripcion = '', userId = null }) {
  return {
    name: 'perfil_update',
    text: `
      UPDATE tbl_perfiles
      SET perfil = $2,
          descripcion_perfil = $3,
          id_user_auditoria = $4,
          fecha_auditoria = NOW()
      WHERE id_perfil = $1;`,
    values: [id, perfil, descripcion, userId]
  };
}

// Eliminar perfil
function remove(id) {
  return {
    name: 'perfil_delete',
    text: `DELETE FROM tbl_perfiles WHERE id_perfil = $1;`,
    values: [id]
  };
}

// Borrar todas las obligaciones de un perfil
function deleteObligacionesByPerfil(idPerfil) {
  return {
    name: 'perfil_oblig_clear',
    text: `DELETE FROM tbl_perfil_obligaciones WHERE id_perfil = $1;`,
    values: [idPerfil]
  };
}

// Insertar una relación perfil-obligación
function insertPerfilObligacion(idPerfil, idObligacion, userId = null) {
  return {
    name: 'perfil_oblig_insert',
    text: `
      INSERT INTO tbl_perfil_obligaciones
        (id_perfil, id_obligacion, id_user_auditoria, fecha_auditoria)
      VALUES ($1, $2, $3, NOW());`,
    values: [idPerfil, idObligacion, userId]
  };
}

// ---------- Excel helpers ----------

// Buscar obligacion por texto normalizado
function findObligacionByText(obligacionTxt) {
  return {
    name: 'obl_find_by_text',
    text: `
      SELECT id_obligacion
      FROM tbl_obligacion_contractual
      WHERE LOWER(TRIM(obligacion_contractual)) = LOWER(TRIM($1))
      LIMIT 1;`,
    values: [obligacionTxt]
  };
}

// Insertar obligacion y retornar id
function insertObligacion(obligacionTxt, userId = null) {
  return {
    name: 'obl_insert',
    text: `
      INSERT INTO tbl_obligacion_contractual (obligacion_contractual, id_user_auditoria, fecha_auditoria)
      VALUES ($1, $2, NOW())
      RETURNING id_obligacion;`,
    values: [obligacionTxt, userId]
  };
}

/**
 * Opcional: asignación de usuarios a un perfil
 */
function clearUsersByPerfil(idPerfil) {
  return {
    name: 'perfil_users_clear',
    text: `UPDATE tbl_usuarios_sgto_act SET id_perfil = NULL WHERE id_perfil = $1;`,
    values: [idPerfil]
  };
}
function assignUsersToPerfil(idPerfil, usuariosIds = []) {
  if (!usuariosIds?.length) return null;
  return {
    name: 'perfil_users_assign',
    text: `UPDATE tbl_usuarios_sgto_act SET id_perfil = $1 WHERE id_user = ANY($2::uuid[]);`,
    values: [idPerfil, usuariosIds]
  };
}

module.exports = {
  list,
  getById,
  getObligacionesByPerfil,
  insert,
  update,
  remove,
  deleteObligacionesByPerfil,
  insertPerfilObligacion,
  // Excel helpers
  findObligacionByText,
  insertObligacion,
  // Opcional users
  clearUsersByPerfil,
  assignUsersToPerfil
};
