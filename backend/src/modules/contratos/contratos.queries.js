// Consultas SQL del módulo Contratos

// ---------- Listado con búsqueda y paginación ----------
// Busca por: número de contrato (c.num_contrato) SIEMPRE
// y por cédula del empleado (e.cedula_empleado) SOLO si la query es 100% numérica.
function list({ q, page, pageSize }) {
  page = Number(page) || 1;
  pageSize = Math.min(Number(pageSize) || 10, 100);
  const off = (page - 1) * pageSize;

  const values = [];
  let where = 'WHERE 1=1';

  const qTrim = (q ?? '').toString().trim();
  const isDigits = /^\d+$/.test(qTrim); // cédula solo si es numérica

  if (qTrim) {
    values.push(`%${qTrim}%`);
    let clause = `(c.num_contrato ILIKE $${values.length})`;

    if (isDigits) {
      values.push(`%${qTrim}%`);
      clause += ` OR (CAST(e.cedula_empleado AS TEXT) LIKE $${values.length})`;
    }

    where += ` AND (${clause})`;
  }

  return {
    data: {
      name: 'contratos_list',
      text: `
        SELECT
          c.id_contrato,
          c.num_contrato,
          c.fecha_inicio_contrato,
          c.fecha_fin_contrato,
          c.valor_contrato,
          c.supervisor_contrato,
          c.id_tipo_contrato,
          c.id_entidad,
          c.id_empleado,
          c.id_user_auditoria,
          c.fecha_auditoria,
          e.cedula_empleado
        FROM tbl_contratos c
        LEFT JOIN tbl_empleados_app_sgt_act e ON e.id_empleado = c.id_empleado
        ${where}
        ORDER BY c.id_contrato DESC
        LIMIT ${pageSize} OFFSET ${off};`,
      values
    },
    count: {
      name: 'contratos_count',
      text: `
        SELECT COUNT(*)::int AS total
        FROM tbl_contratos c
        LEFT JOIN tbl_empleados_app_sgt_act e ON e.id_empleado = c.id_empleado
        ${where};`,
      values
    },
    page, pageSize
  };
}

// ---------- Detalle ----------
function getById(id) {
  return {
    name: 'contratos_get',
    text: `
      SELECT
        c.id_contrato,
        c.num_contrato,
        c.fecha_inicio_contrato,
        c.fecha_fin_contrato,
        c.valor_contrato,
        c.supervisor_contrato,
        c.id_tipo_contrato,
        c.id_entidad,
        c.id_empleado,
        c.id_user_auditoria,
        c.fecha_auditoria
      FROM tbl_contratos c
      WHERE c.id_contrato = $1;`,
    values: [id]
  };
}

// ---------- Insert ----------
function insert({
  num_contrato,
  fecha_inicio_contrato,
  fecha_fin_contrato,
  valor_contrato,
  supervisor_contrato,
  id_tipo_contrato,
  id_entidad,
  id_empleado,
  userId
}) {
  return {
    name: 'contratos_insert',
    text: `
      INSERT INTO tbl_contratos (
        num_contrato,
        fecha_inicio_contrato,
        fecha_fin_contrato,
        valor_contrato,
        supervisor_contrato,
        id_tipo_contrato,
        id_entidad,
        id_empleado,
        id_user_auditoria,
        fecha_auditoria
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING id_contrato;`,
    values: [
      num_contrato,
      fecha_inicio_contrato,
      fecha_fin_contrato,
      valor_contrato,
      supervisor_contrato,
      id_tipo_contrato,
      id_entidad,
      id_empleado,
      userId
    ]
  };
}

// ---------- Update ----------
function update(id, {
  num_contrato,
  fecha_inicio_contrato,
  fecha_fin_contrato,
  valor_contrato,
  supervisor_contrato,
  id_tipo_contrato,
  id_entidad,
  id_empleado,
  userId
}) {
  return {
    name: 'contratos_update',
    text: `
      UPDATE tbl_contratos
      SET
        num_contrato = $2,
        fecha_inicio_contrato = $3,
        fecha_fin_contrato = $4,
        valor_contrato = $5,
        supervisor_contrato = $6,
        id_tipo_contrato = $7,
        id_entidad = $8,
        id_empleado = $9,
        id_user_auditoria = $10,
        fecha_auditoria = NOW()
      WHERE id_contrato = $1;`,
    values: [
      id,
      num_contrato,
      fecha_inicio_contrato,
      fecha_fin_contrato,
      valor_contrato,
      supervisor_contrato,
      id_tipo_contrato,
      id_entidad,
      id_empleado,
      userId
    ]
  };
}

// ---------- Catálogos (para selects) ----------
// ⚠️ OJO: en tu BD la columna es "contrato", no "tipo_contrato".
function listTiposContrato() {
  return {
    name: 'contratos_tipos_list',
    text: `
      SELECT id_tipo_contrato AS id, contrato AS nombre
      FROM tbl_tipos_contrato
      ORDER BY contrato ASC;`,
    values: []
  };
}

function listEntidades() {
  return {
    name: 'contratos_entidades_list',
    text: `
      SELECT id_entidad AS id, entidad AS nombre
      FROM tbl_entidad_contratante
      ORDER BY entidad ASC;`,
    values: []
  };
}

// ---------- Validaciones FK ----------
function verifyEmpleado(id_empleado) {
  return {
    name: 'contratos_verify_empleado',
    text: `SELECT 1 FROM tbl_empleados_app_sgt_act WHERE id_empleado = $1 LIMIT 1;`,
    values: [id_empleado]
  };
}
function verifyTipoContrato(id_tipo_contrato) {
  return {
    name: 'contratos_verify_tipo',
    text: `SELECT 1 FROM tbl_tipos_contrato WHERE id_tipo_contrato = $1 LIMIT 1;`,
    values: [id_tipo_contrato]
  };
}
function verifyEntidad(id_entidad) {
  return {
    name: 'contratos_verify_entidad',
    text: `SELECT 1 FROM tbl_entidad_contratante WHERE id_entidad = $1 LIMIT 1;`,
    values: [id_entidad]
  };
}

module.exports = {
  list,
  getById,
  insert,
  update,
  listTiposContrato,
  listEntidades,
  verifyEmpleado,
  verifyTipoContrato,
  verifyEntidad
};
