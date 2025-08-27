// Todo el SQL del módulo Perfiles vive aquí

// Listado con búsqueda y paginación
const buildList = (q, page, pageSize) => {
  page = Number(page) || 1;
  pageSize = Math.min(Number(pageSize) || 10, 100);
  const off = (page - 1) * pageSize;

  const values = [];
  let where = 'WHERE 1=1';
  if (q) {
    values.push(`%${q}%`);
    where += ` AND (perfil ILIKE $${values.length} OR descripcion_perfil ILIKE $${values.length})`;
  }

  return {
    data: {
      name: 'perfiles_list',
      text: `
        SELECT id_perfil, perfil, descripcion_perfil, fecha_auditoria
        FROM tbl_perfiles
        ${where}
        ORDER BY perfil ASC
        LIMIT ${pageSize} OFFSET ${off};`,
      values
    },
    count: {
      name: 'perfiles_count',
      text: `SELECT COUNT(*)::int AS total FROM tbl_perfiles ${where};`,
      values
    },
    page, pageSize
  };
};

module.exports = {
  // Listado básico
  list(q, page, pageSize) { return buildList(q, page, pageSize); },

  // Perfil por id (datos base)
  getPerfilById(id) {
    return {
      name: 'perfil_get',
      text: `
        SELECT id_perfil, perfil, descripcion_perfil, id_user_auditoria, fecha_auditoria
        FROM tbl_perfiles
        WHERE id_perfil = $1
        LIMIT 1;`,
      values: [id]
    };
  },

  // Obligaciones asignadas a un perfil
  getObligacionesByPerfil(idPerfil) {
    return {
      name: 'perfil_oblig_list',
      text: `
        SELECT id_obligacion
        FROM tbl_perfil_obligaciones
        WHERE id_perfil = $1
        ORDER BY id_obligacion;`,
      values: [idPerfil]
    };
  },

  // Usuarios que tienen ese perfil
  getUsersByPerfil(idPerfil) {
    return {
      name: 'perfil_users_list',
      text: `
        SELECT id_user, TRIM(name_user) AS name, TRIM(email_user) AS email
        FROM tbl_users
        WHERE id_perfil = $1
        ORDER BY name;`,
      values: [idPerfil]
    };
  },

  // Crear perfil
  insert(perfil, descripcion, userId) {
    return {
      name: 'perfiles_insert',
      text: `
        INSERT INTO tbl_perfiles (perfil, descripcion_perfil, id_user_auditoria)
        VALUES ($1, $2, $3)
        RETURNING id_perfil;`,
      values: [perfil, descripcion || null, userId]
    };
  },

  // Actualizar perfil (solo datos base)
  update(id, perfil, descripcion, userId) {
    return {
      name: 'perfiles_update',
      text: `
        UPDATE tbl_perfiles
        SET perfil = $2,
            descripcion_perfil = $3,
            id_user_auditoria = $4,
            fecha_auditoria = NOW()
        WHERE id_perfil = $1;`,
      values: [id, perfil, descripcion || null, userId]
    };
  },

  // Eliminar perfil
  remove(id) {
    return {
      name: 'perfiles_delete',
      text: `DELETE FROM tbl_perfiles WHERE id_perfil = $1;`,
      values: [id]
    };
  },

  // --- Asignaciones ---

  // Borra todas las obligaciones del perfil
  deletePerfilObligaciones(idPerfil) {
    return {
      name: 'perfil_oblig_delete_all',
      text: `DELETE FROM tbl_perfil_obligaciones WHERE id_perfil = $1;`,
      values: [idPerfil]
    };
  },

  // Inserta obligaciones en bloque: (id_perfil, id_obligacion, id_user_auditoria)
  bulkInsertPerfilObligaciones(idPerfil, obligacionesIds = [], userId) {
    if (!obligacionesIds.length) return null;
    const tuples = obligacionesIds.map((_, i) => `($1, $${i + 2}, $${obligacionesIds.length + 2})`).join(',');
    return {
      name: 'perfil_oblig_bulk_insert',
      text: `INSERT INTO tbl_perfil_obligaciones (id_perfil, id_obligacion, id_user_auditoria) VALUES ${tuples};`,
      values: [idPerfil, ...obligacionesIds, userId]
    };
  },

  // Quita el perfil a todos los usuarios que hoy lo tienen
  clearUsersByPerfil(idPerfil) {
    return {
      name: 'perfil_users_clear_all',
      text: `UPDATE tbl_users SET id_perfil = NULL WHERE id_perfil = $1;`,
      values: [idPerfil]
    };
  },

  // Quita el perfil a todos EXCEPTO a los indicados
  clearUsersExcept(idPerfil, usuariosIds = []) {
    if (!usuariosIds.length) return null;
    return {
      name: 'perfil_users_clear_except',
      text: `UPDATE tbl_users SET id_perfil = NULL WHERE id_perfil = $1 AND id_user <> ALL($2::uuid[]);`,
      values: [idPerfil, usuariosIds]
    };
  },

  // Asigna el perfil a la lista de usuarios
  assignUsersToPerfil(idPerfil, usuariosIds = []) {
    if (!usuariosIds.length) return null;
    return {
      name: 'perfil_users_assign',
      text: `UPDATE tbl_users SET id_perfil = $1 WHERE id_user = ANY($2::uuid[]);`,
      values: [idPerfil, usuariosIds]
    };
  }
};
