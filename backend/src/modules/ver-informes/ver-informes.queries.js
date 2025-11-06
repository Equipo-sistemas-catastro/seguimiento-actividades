// backend/src/modules/ver-informes/ver-informes.queries.js
module.exports = {
  // Buscar empleados (sin usar unaccent)
  qBuscarEmpleados: `
    SELECT 
      e.id_empleado,
      e.cedula_empleado,
      TRIM(BOTH FROM concat_ws(' ',
        NULLIF(e.primer_nombre_empl,''), 
        NULLIF(e.segundo_nombre_empl,''),
        NULLIF(e.primer_apellido_empl,''), 
        NULLIF(e.segundo_apellido_empl,'')
      )) AS nombre_completo
    FROM tbl_empleados_app_sgt_act e
    WHERE ($1 = '' OR
           lower(e.primer_nombre_empl)    LIKE lower('%' || $1 || '%') OR
           lower(e.segundo_nombre_empl)   LIKE lower('%' || $1 || '%') OR
           lower(e.primer_apellido_empl)  LIKE lower('%' || $1 || '%') OR
           lower(e.segundo_apellido_empl) LIKE lower('%' || $1 || '%'))
      AND e.estado = 'activo'
    ORDER BY e.primer_apellido_empl, e.primer_nombre_empl
    LIMIT 20;
  `,

  // Años disponibles para un empleado según actividades
  qAniosByEmpleado: `
    SELECT DISTINCT
      EXTRACT(YEAR FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT AS anio
    FROM tbl_actividades a
    WHERE a.id_empleado = $1
    ORDER BY 1 DESC;
  `,

  // Meses disponibles para un año dado
  qMesesByEmpleado: `
    SELECT DISTINCT
      EXTRACT(MONTH FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT AS mes
    FROM tbl_actividades a
    WHERE a.id_empleado = $1
      AND EXTRACT(YEAR FROM COALESCE(a.fecha_fin_actividad, a.fecha_fin_programada, a.fecha_inicio_actividad))::INT = $2
    ORDER BY 1;
  `,

  // Informe de actividades para el empleado, año y mes seleccionados
  qInformeByEmpleado: `
    WITH empleado AS (
      SELECT 
        e.id_empleado,
        TRIM(BOTH FROM concat_ws(' ',
          NULLIF(e.primer_nombre_empl,''), 
          NULLIF(e.segundo_nombre_empl,''),
          NULLIF(e.primer_apellido_empl,''), 
          NULLIF(e.segundo_apellido_empl,'')
        )) AS nombre_empleado
      FROM tbl_empleados_app_sgt_act e
      WHERE e.id_empleado = $1
    ),
    contrato AS (
      SELECT c.*
      FROM tbl_contratos c
      JOIN empleado e ON e.id_empleado = c.id_empleado
      ORDER BY c.fecha_fin_contrato DESC
      LIMIT 1
    ),
    obligaciones AS (
      SELECT DISTINCT o.id_obligacion, o.obligacion_contractual
      FROM tbl_empleado_perfil ep
      JOIN tbl_perfil_obligaciones po ON po.id_perfil = ep.id_perfil
      JOIN tbl_obligacion_contractual o ON o.id_obligacion = po.id_obligacion
      WHERE ep.id_empleado = $1 AND ep.estado = 'activo'
    ),
    actividades_oblig AS (
      SELECT 
        ao.id_obligacion,
        STRING_AGG(DISTINCT a.actividad, E'\\n- ' ORDER BY a.actividad) AS descripcion_actividades
      FROM tbl_actividades a
      JOIN tbl_actividad_obligacion ao ON ao.id_actividad = a.id_actividad
      WHERE a.id_empleado = $1
        AND (
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
    empleado_comp AS (
      SELECT co.componente
      FROM tbl_empleado_componente ec
      JOIN tbl_componentes co ON co.id_componente = ec.id_componente
      WHERE ec.id_empleado = $1 AND ec.estado = 'activo'
      ORDER BY ec.id_empleado DESC
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
      evb.url_evidencia ||
      CHR(92) || 'COMPONENTE ' || UPPER(ec.componente) ||
      CHR(92) || UPPER(TO_CHAR(make_date($2::INT, $3::INT, 1), 'TMMonth')) ||
      CHR(92) || UPPER(e.nombre_empleado) AS url_evidencia
    FROM empleado e
    JOIN contrato c ON TRUE
    JOIN tbl_entidad_contratante ent ON ent.id_entidad = c.id_entidad
    JOIN obligaciones o ON TRUE
    LEFT JOIN actividades_oblig ao ON ao.id_obligacion = o.id_obligacion
    LEFT JOIN evidencia_base evb ON TRUE
    LEFT JOIN empleado_comp ec ON TRUE
    ORDER BY o.obligacion_contractual;
  `,
};
