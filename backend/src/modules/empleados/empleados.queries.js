const ALLOWED_SORT = new Set([
  'id_empleado',
  'cedula_empleado',
  'primer_nombre_empl',
  'primer_apellido_empl',
  'email_empleado',
  'estado',
  'fecha_auditoria',
]);

function normalizePagination({ page, pageSize, limit, offset }) {
  let _limit, _offset, _page, _pageSize;
  if (Number.isInteger(limit) || Number.isInteger(offset)) {
    _limit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    _offset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    _page = Math.floor(_offset / _limit) + 1;
    _pageSize = _limit;
  } else {
    _page = Number.isInteger(page) && page > 0 ? page : 1;
    _pageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
    _limit = _pageSize;
    _offset = (_page - 1) * _pageSize;
  }
  return { limit: _limit, offset: _offset, page: _page, pageSize: _pageSize };
}

function buildListEmpleadosQuery({ q, estado, sortBy, sortDir, page, pageSize, limit, offset }) {
  const vals = [];
  const where = [];

  if (q && String(q).trim() !== '') {
    vals.push(`%${q.trim()}%`);
    const p = `$${vals.length}`;
    where.push(
      `(CAST(cedula_empleado AS TEXT) ILIKE ${p}
        OR primer_nombre_empl ILIKE ${p}
        OR segundo_nombre_empl ILIKE ${p}
        OR primer_apellido_empl ILIKE ${p}
        OR segundo_apellido_empl ILIKE ${p}
        OR email_empleado ILIKE ${p})`
    );
  }
  if (estado && (estado === 'activo' || estado === 'inactivo')) {
    vals.push(estado);
    where.push(`estado = $${vals.length}`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = ALLOWED_SORT.has(sortBy) ? sortBy : 'id_empleado';
  const orderDir = String(sortDir || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const { limit: _limit, offset: _offset, page: _page, pageSize: _pageSize } =
    normalizePagination({ page, pageSize, limit, offset });

  vals.push(_limit); const pLimit = `$${vals.length}`;
  vals.push(_offset); const pOffset = `$${vals.length}`;

  const text = `
    SELECT id_empleado, cedula_empleado,
           primer_nombre_empl, segundo_nombre_empl,
           primer_apellido_empl, segundo_apellido_empl,
           fecha_nacimiento_empl, email_empleado, movil_empleado,
           estado, fecha_auditoria
    FROM tbl_empleados_app_sgt_act
    ${whereSQL}
    ORDER BY ${orderBy} ${orderDir}
    LIMIT ${pLimit} OFFSET ${pOffset}
  `;
  return { text, vals, page: _page, pageSize: _pageSize };
}

function buildCountEmpleadosQuery({ q, estado }) {
  const vals = [];
  const where = [];
  if (q && String(q).trim() !== '') {
    vals.push(`%${q.trim()}%`);
    const p = `$${vals.length}`;
    where.push(
      `(CAST(cedula_empleado AS TEXT) ILIKE ${p}
        OR primer_nombre_empl ILIKE ${p}
        OR segundo_nombre_empl ILIKE ${p}
        OR primer_apellido_empl ILIKE ${p}
        OR segundo_apellido_empl ILIKE ${p}
        OR email_empleado ILIKE ${p})`
    );
  }
  if (estado && (estado === 'activo' || estado === 'inactivo')) {
    vals.push(estado);
    where.push(`estado = $${vals.length}`);
  }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return { text: `SELECT COUNT(*)::INT AS total FROM tbl_empleados_app_sgt_act ${whereSQL}`, vals };
}

// ---------- INSERT empleado
const INSERT_EMPLEADO = `
  INSERT INTO tbl_empleados_app_sgt_act
  (cedula_empleado, primer_nombre_empl, segundo_nombre_empl, primer_apellido_empl,
   segundo_apellido_empl, fecha_nacimiento_empl, email_empleado, movil_empleado,
   estado, id_user_auditoria, fecha_auditoria)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9,'activo'), $10, NOW())
  RETURNING *
`;

// ---------- DETALLE: empleado + historiales
const GET_EMPLEADO_BY_ID = `SELECT * FROM tbl_empleados_app_sgt_act WHERE id_empleado = $1`;

const GET_PERFILES_ACTIVOS = `
  SELECT ep.id_empl_perf, ep.id_perfil, p.perfil, ep.estado, ep.fecha_inicio, ep.fecha_fin
  FROM tbl_empleado_perfil ep
  JOIN tbl_perfiles p ON p.id_perfil = ep.id_perfil
  WHERE ep.id_empleado = $1 AND ep.estado = 'activo' AND ep.fecha_fin IS NULL
  ORDER BY ep.fecha_inicio DESC
`;
const GET_PERFILES_HISTORIAL = `
  SELECT ep.id_empl_perf, ep.id_perfil, p.perfil, ep.estado, ep.fecha_inicio, ep.fecha_fin
  FROM tbl_empleado_perfil ep
  JOIN tbl_perfiles p ON p.id_perfil = ep.id_perfil
  WHERE ep.id_empleado = $1
  ORDER BY ep.fecha_inicio DESC
`;

const GET_COMPONENTES_ACTIVOS = `
  SELECT ec.id_empl_comp, ec.id_componente, c.componente, ec.estado, ec.fecha_inicio, ec.fecha_fin
  FROM tbl_empleado_componente ec
  JOIN tbl_componentes c ON c.id_componente = ec.id_componente
  WHERE ec.id_empleado = $1 AND ec.estado = 'activo' AND ec.fecha_fin IS NULL
  ORDER BY ec.fecha_inicio DESC
`;
const GET_COMPONENTES_HISTORIAL = `
  SELECT ec.id_empl_comp, ec.id_componente, c.componente, ec.estado, ec.fecha_inicio, ec.fecha_fin
  FROM tbl_empleado_componente ec
  JOIN tbl_componentes c ON c.id_componente = ec.id_componente
  WHERE ec.id_empleado = $1
  ORDER BY ec.fecha_inicio DESC
`;

// ---------- UPDATE empleado
const UPDATABLE_FIELDS = new Set([
  'cedula_empleado','primer_nombre_empl','segundo_nombre_empl',
  'primer_apellido_empl','segundo_apellido_empl','fecha_nacimiento_empl',
  'email_empleado','movil_empleado','estado'
]);
function buildUpdateEmpleadoQuery(idEmpleado, payload, userId) {
  const sets = [], vals = []; let idx = 1;
  for (const [k, v] of Object.entries(payload || {})) {
    if (!UPDATABLE_FIELDS.has(k)) continue;
    vals.push(v ?? null);
    sets.push(`${k} = $${idx++}`);
  }
  if (sets.length === 0) return null;
  vals.push(userId); sets.push(`id_user_auditoria = $${idx++}`);
  sets.push(`fecha_auditoria = NOW()`);
  vals.push(idEmpleado);
  const text = `
    UPDATE tbl_empleados_app_sgt_act
       SET ${sets.join(', ')}
     WHERE id_empleado = $${idx}
     RETURNING *
  `;
  return { text, vals };
}

// ---------- ASIGNACIONES (perfil/componente con histórico)
const VERIFY_EMPLEADO_ACTIVO = `
  SELECT 1 FROM tbl_empleados_app_sgt_act WHERE id_empleado = $1 AND estado = 'activo'
`;
const VERIFY_PERFIL_EXISTS = `SELECT 1 FROM tbl_perfiles WHERE id_perfil = $1`;
const CLOSE_PERFIL_ACTIVO = `
  UPDATE tbl_empleado_perfil
     SET estado='inactivo', fecha_fin=NOW(),
         id_user_auditoria=$2, fecha_auditoria=NOW()
   WHERE id_empleado=$1 AND estado='activo' AND fecha_fin IS NULL
`;
const INSERT_EMPL_PERFIL = `
  INSERT INTO tbl_empleado_perfil
    (id_empleado,id_perfil,estado,fecha_inicio,fecha_fin,id_user_auditoria,fecha_auditoria)
  VALUES ($1,$2,'activo',NOW(),NULL,$3,NOW())
  RETURNING *
`;

const VERIFY_COMPONENTE_EXISTS = `SELECT 1 FROM tbl_componentes WHERE id_componente=$1`;
const CLOSE_COMPONENTE_ACTIVO = `
  UPDATE tbl_empleado_componente
     SET estado='inactivo', fecha_fin=NOW(),
         id_user_auditoria=$2, fecha_auditoria=NOW()
   WHERE id_empleado=$1 AND estado='activo' AND fecha_fin IS NULL
`;
const INSERT_EMPL_COMPONENTE = `
  INSERT INTO tbl_empleado_componente
    (id_empleado,id_componente,estado,fecha_inicio,fecha_fin,id_user_auditoria,fecha_auditoria)
  VALUES ($1,$2,'activo',NOW(),NULL,$3,NOW())
  RETURNING *
`;

module.exports = {
  ALLOWED_SORT,
  buildListEmpleadosQuery,
  buildCountEmpleadosQuery,
  normalizePagination,
  INSERT_EMPLEADO,
  GET_EMPLEADO_BY_ID,
  GET_PERFILES_ACTIVOS,
  GET_PERFILES_HISTORIAL,
  GET_COMPONENTES_ACTIVOS,
  GET_COMPONENTES_HISTORIAL,
  buildUpdateEmpleadoQuery,
  // asignaciones:
  VERIFY_EMPLEADO_ACTIVO,
  VERIFY_PERFIL_EXISTS,
  CLOSE_PERFIL_ACTIVO,
  INSERT_EMPL_PERFIL,
  VERIFY_COMPONENTE_EXISTS,
  CLOSE_COMPONENTE_ACTIVO,
  INSERT_EMPL_COMPONENTE,
};
