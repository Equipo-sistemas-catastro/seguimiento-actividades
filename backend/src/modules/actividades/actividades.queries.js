// backend/src/modules/actividades/actividades.queries.js

function empleadoIdByUserId(userId) {
  return {
    text: `
      SELECT e.id_empleado
      FROM tbl_usuarios_sgto_act u
      JOIN tbl_empleados_app_sgt_act e
        ON e.cedula_empleado = u.cedula_user
      WHERE u.id_user = $1;`,
    values: [userId],
  };
}

function getReqCore(id_req) {
  return {
    text: `
      SELECT r.id_req, r.fecha_inicio_req, r.fecha_fin_req, r.id_estado
      FROM tbl_requerimiento r
      WHERE r.id_req = $1;`,
    values: [id_req],
  };
}

function checkEmpleadoAsignado(id_req, id_empleado) {
  return {
    text: `
      SELECT 1
      FROM tbl_asigna_requerimiento ar
      WHERE ar.id_req = $1 AND ar.id_empleado = $2;`,
    values: [id_req, id_empleado],
  };
}

function insertActividad({
  actividad,
  fecha_inicio_actividad,
  fecha_fin_programada,
  fecha_fin_actividad,         // <--- NUEVO
  id_req,
  id_empleado,
  id_estado,
  userId,
}) {
  return {
    text: `
      INSERT INTO tbl_actividades
        (actividad, fecha_inicio_actividad, fecha_fin_programada,
         fecha_fin_actividad, id_req, id_empleado, id_estado,
         id_user_auditoria, fecha_auditoria)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      RETURNING id_actividad;`,
    values: [
      actividad,
      fecha_inicio_actividad,
      fecha_fin_programada,
      fecha_fin_actividad ?? null, // puede ser null u hoy
      id_req,
      id_empleado,
      id_estado,
      userId,
    ],
  };
}

function obligacionesByEmpleadoActivo(id_empleado) {
  return {
    text: `
      SELECT o.id_obligacion, o.obligacion_contractual
      FROM tbl_empleado_perfil ep
      JOIN tbl_perfil_obligaciones po ON po.id_perfil = ep.id_perfil
      JOIN tbl_obligacion_contractual o ON o.id_obligacion = po.id_obligacion
      WHERE ep.id_empleado = $1
        AND ep.estado = 'activo'
      ORDER BY o.obligacion_contractual;`,
    values: [id_empleado],
  };
}

function insertActividadObligaciones(id_actividad, obligacionesIds = [], userId) {
  if (!Array.isArray(obligacionesIds) || obligacionesIds.length === 0) {
    return { text: 'SELECT 1 WHERE false;', values: [] };
  }
  return {
    text: `
      INSERT INTO tbl_actividad_obligacion
        (id_actividad, id_obligacion, id_user_auditoria, fecha_auditoria)
      SELECT $1, x.id_obligacion, $3, NOW()
      FROM UNNEST($2::bigint[]) AS x(id_obligacion);`,
    values: [id_actividad, obligacionesIds, userId],
  };
}

/* ========================= NUEVAS QUERIES ========================= */

function actividadesByReqEmpleado(id_req, id_empleado) {
  return {
    text: `
      SELECT
        a.id_actividad,
        a.actividad,
        a.fecha_inicio_actividad,
        a.fecha_fin_programada,
        a.fecha_fin_actividad,
        a.id_estado,
        e.estado,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id_obligacion', o.id_obligacion,
              'obligacion_contractual', o.obligacion_contractual
            )
          ) FILTER (WHERE o.id_obligacion IS NOT NULL),
          '[]'
        ) AS obligaciones
      FROM tbl_actividades a
      JOIN tbl_estados e ON e.id_estado = a.id_estado
      LEFT JOIN tbl_actividad_obligacion ao ON ao.id_actividad = a.id_actividad
      LEFT JOIN tbl_obligacion_contractual o ON o.id_obligacion = ao.id_obligacion
      WHERE a.id_req = $1
        AND a.id_empleado = $2
      GROUP BY a.id_actividad, e.estado
      ORDER BY a.fecha_inicio_actividad DESC, a.id_actividad DESC;`,
    values: [id_req, id_empleado],
  };
}

function actividadByIdForEmpleado(id_actividad, id_empleado) {
  return {
    text: `
      SELECT
        a.id_actividad,
        a.id_req,
        a.actividad,
        a.fecha_inicio_actividad,
        a.fecha_fin_programada,
        a.fecha_fin_actividad,
        a.id_estado,
        e.estado,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id_obligacion', o.id_obligacion,
              'obligacion_contractual', o.obligacion_contractual
            )
          ) FILTER (WHERE o.id_obligacion IS NOT NULL),
          '[]'
        ) AS obligaciones
      FROM tbl_actividades a
      JOIN tbl_estados e ON e.id_estado = a.id_estado
      LEFT JOIN tbl_actividad_obligacion ao ON ao.id_actividad = a.id_actividad
      LEFT JOIN tbl_obligacion_contractual o ON o.id_obligacion = ao.id_obligacion
      WHERE a.id_actividad = $1
        AND a.id_empleado = $2
      GROUP BY a.id_actividad, e.estado
      LIMIT 1;`,
    values: [id_actividad, id_empleado],
  };
}

function actividadCore(id_actividad) {
  return {
    text: `
      SELECT id_actividad, id_req, id_empleado, id_estado
      FROM tbl_actividades
      WHERE id_actividad = $1;`,
    values: [id_actividad],
  };
}

function updateActividadBasic({
  id_actividad,
  actividad,
  fecha_inicio_actividad,
  fecha_fin_programada,
  id_estado,
  fecha_fin_actividad, // <--- NUEVO (puede ser null)
  userId,
  id_empleado,
}) {
  return {
    text: `
      UPDATE tbl_actividades
      SET actividad = $1,
          fecha_inicio_actividad = $2,
          fecha_fin_programada = $3,
          id_estado = $4,
          fecha_fin_actividad = COALESCE($5, fecha_fin_actividad),
          id_user_auditoria = $6,
          fecha_auditoria = NOW()
      WHERE id_actividad = $7
        AND id_empleado = $8
      RETURNING id_actividad;`,
    values: [
      actividad,
      fecha_inicio_actividad,
      fecha_fin_programada,
      id_estado,
      fecha_fin_actividad ?? null,
      userId,
      id_actividad,
      id_empleado,
    ],
  };
}

// 🔹 NUEVO: borrar todas las obligaciones de una actividad
function deleteActividadObligaciones(id_actividad) {
  return {
    text: `DELETE FROM tbl_actividad_obligacion WHERE id_actividad = $1;`,
    values: [id_actividad],
  };
}

/** =========================================================
 * 🔸 NUEVO: Listado Kanban de "Mis actividades" (sin id_req)
 * Reglas exactas:
 *  - POR HACER (1): todas
 *  - EN EJECUCIÓN (2) y FINALIZADA (3): solo si fecha_fin_programada >= primer día del mes actual
 * Flags:
 *  - incumplida: estado=2 AND fecha_fin_programada < CURRENT_DATE
 *  - finalizada_incumplida: estado=3 AND fecha_fin_actividad < fecha_fin_programada
 * Incluye descripcion del requerimiento para pintar la card.
 * ========================================================= */
function listMisActividadesKanban(id_empleado) {
  return {
    text: `
      WITH base AS (
        SELECT
          a.id_actividad,
          a.actividad,
          a.fecha_inicio_actividad,
          a.fecha_fin_programada,
          a.fecha_fin_actividad,
          a.id_estado,
          e.estado AS nombre_estado,
          a.id_req,
          r.descripcion_req
        FROM tbl_actividades a
        JOIN tbl_estados e ON e.id_estado = a.id_estado
        LEFT JOIN tbl_requerimiento r ON r.id_req = a.id_req
        WHERE a.id_empleado = $1
          AND (
            a.id_estado = 1
            OR (a.id_estado IN (2,3)
                AND a.fecha_fin_programada >= date_trunc('month', CURRENT_DATE)::date)
          )
      )
      SELECT
        b.*,
        (b.id_estado = 2 AND b.fecha_fin_programada < CURRENT_DATE)::boolean AS incumplida,
        (
          b.id_estado = 3
          AND b.fecha_fin_actividad IS NOT NULL
          AND b.fecha_fin_actividad < b.fecha_fin_programada
        )::boolean AS finalizada_incumplida
      FROM base b
      ORDER BY b.id_estado, b.fecha_fin_programada DESC, b.id_actividad DESC;`,
    values: [id_empleado],
  };
}

module.exports = {
  empleadoIdByUserId,
  getReqCore,
  checkEmpleadoAsignado,
  insertActividad,
  obligacionesByEmpleadoActivo,
  insertActividadObligaciones,
  // nuevos
  actividadesByReqEmpleado,
  actividadByIdForEmpleado,
  actividadCore,
  updateActividadBasic,
  deleteActividadObligaciones, // nuevo
  // kanban
  listMisActividadesKanban,
};
