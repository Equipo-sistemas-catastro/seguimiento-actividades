// backend/src/modules/informe-actividades/informe.queries.js
module.exports = {
  qAnios: `
    WITH empleado AS (
      SELECT e.id_empleado
      FROM tbl_users u
      JOIN tbl_empleados_app_sgt_act e ON u.cedula_user = e.cedula_empleado
      WHERE u.id_user = $1
    )
    SELECT DISTINCT
           EXTRACT(YEAR FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT AS anio
    FROM tbl_actividades a
    JOIN empleado e ON e.id_empleado = a.id_empleado
    ORDER BY 1 DESC;
  `,

  qMeses: `
    WITH empleado AS (
      SELECT e.id_empleado
      FROM tbl_users u
      JOIN tbl_empleados_app_sgt_act e ON u.cedula_user = e.cedula_empleado
      WHERE u.id_user = $1
    )
    SELECT DISTINCT
           EXTRACT(MONTH FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT AS mes
    FROM tbl_actividades a
    JOIN empleado e ON e.id_empleado = a.id_empleado
    WHERE EXTRACT(YEAR FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT = $2
    ORDER BY 1;
  `,

  qInforme: `
    WITH empleado AS (
        SELECT 
            e.id_empleado,
            e.primer_nombre_empl,
            e.segundo_nombre_empl,
            e.primer_apellido_empl,
            e.segundo_apellido_empl,
            TRIM(BOTH FROM concat_ws(
                ' ',
                NULLIF(e.primer_nombre_empl, ''),
                NULLIF(e.segundo_nombre_empl, ''),
                NULLIF(e.primer_apellido_empl, ''),
                NULLIF(e.segundo_apellido_empl, '')
            )) AS nombre_empleado
        FROM tbl_users u
        JOIN tbl_empleados_app_sgt_act e ON u.cedula_user = e.cedula_empleado
        WHERE u.id_user = $1
    ),
    contrato AS (
        SELECT c.*
        FROM tbl_contratos c
        JOIN empleado e ON e.id_empleado = c.id_empleado
        WHERE c.fecha_fin_contrato >= NOW()
        LIMIT 1
    ),
    obligaciones AS (
        SELECT DISTINCT o.id_obligacion, o.obligacion_contractual
        FROM empleado e
        JOIN tbl_empleado_perfil ep ON ep.id_empleado = e.id_empleado AND ep.estado = 'activo'
        JOIN tbl_perfil_obligaciones po ON po.id_perfil = ep.id_perfil
        JOIN tbl_obligacion_contractual o ON o.id_obligacion = po.id_obligacion
    ),
    actividades_oblig AS (
        SELECT 
            ao.id_obligacion,
            STRING_AGG(DISTINCT a.actividad, E'\\n- ' ORDER BY a.actividad) AS descripcion_actividades
        FROM empleado e
        JOIN tbl_actividades a ON a.id_empleado = e.id_empleado
        JOIN tbl_actividad_obligacion ao ON ao.id_actividad = a.id_actividad
        WHERE (
          (a.id_estado = 2 AND EXTRACT(MONTH FROM a.fecha_fin_programada)::INT = $3 
             AND EXTRACT(YEAR FROM a.fecha_fin_programada)::INT = $2)
          OR
          (a.id_estado = 3 AND EXTRACT(MONTH FROM a.fecha_fin_actividad)::INT = $3 
             AND EXTRACT(YEAR FROM a.fecha_fin_actividad)::INT = $2)
        )
        GROUP BY ao.id_obligacion
    ),
    evidencia_base AS (
        SELECT url_evidencia
        FROM tbl_evidencias
        ORDER BY id_evidencia DESC
        LIMIT 1
    ),
    componente AS (
        SELECT co.componente
        FROM empleado e
        JOIN tbl_empleado_componente ec ON ec.id_empleado = e.id_empleado AND ec.estado = 'activo'
        JOIN tbl_componentes co ON co.id_componente = ec.id_componente
        LIMIT 1
    )
    SELECT 
      e.id_empleado,
      e.nombre_empleado,
      c.num_contrato, 
      c.objeto_contrato,
      c.supervisor_contrato, 
      c.valor_contrato,
      c.fecha_inicio_contrato, 
      c.fecha_fin_contrato,
      ent.entidad AS entidad_contratante,
      ROUND(EXTRACT(MONTH FROM age(c.fecha_fin_contrato, c.fecha_inicio_contrato))) || ' meses y ' ||
      ROUND(EXTRACT(DAY FROM age(c.fecha_fin_contrato, c.fecha_inicio_contrato))) || ' días' AS duracion_contrato,
      o.obligacion_contractual,
      COALESCE(ao.descripcion_actividades, 'No fue programada esta actividad para este periodo') AS descripcion_actividades,
      -- ✅ Conserva las barras iniciales de la URL
      evb.url_evidencia ||
      CHR(92) || 'COMPONENTE ' || UPPER(co.componente) ||
      CHR(92) || UPPER(TO_CHAR(make_date($2::INT, $3::INT, 1), 'TMMonth')) ||
      CHR(92) || UPPER(e.nombre_empleado) AS url_evidencia
    FROM empleado e
    JOIN contrato c ON c.id_empleado = e.id_empleado
    JOIN tbl_entidad_contratante ent ON ent.id_entidad = c.id_entidad
    JOIN obligaciones o ON TRUE
    LEFT JOIN actividades_oblig ao ON ao.id_obligacion = o.id_obligacion
    LEFT JOIN evidencia_base evb ON TRUE
    LEFT JOIN componente co ON TRUE
    ORDER BY o.obligacion_contractual;
  `
};
