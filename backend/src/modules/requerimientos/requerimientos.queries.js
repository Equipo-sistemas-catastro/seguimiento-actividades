// backend/src/modules/requerimientos/requerimientos.queries.js

// ---------- List ----------
function list({ q, estado, page, pageSize, assignedEmpleadoId = null }) {
  page = Number(page) || 1;
  pageSize = Math.min(Number(pageSize) || 10, 100);
  const off = (page - 1) * pageSize;

  const values = [];
  let where = 'WHERE 1=1';

  if (q) {
    values.push(`%${q}%`);
    where += ` AND r.descripcion_req ILIKE $${values.length}`;
  }
  if (estado) {
    values.push(estado);
    where += ` AND r.id_estado = $${values.length}`;
  }
  if (assignedEmpleadoId) {
    values.push(assignedEmpleadoId);
    // Solo requerimientos asignados a ese empleado
    where += ` AND EXISTS (
      SELECT 1
      FROM tbl_asigna_requerimiento ar
      WHERE ar.id_req = r.id_req AND ar.id_empleado = $${values.length}
    )`;
  }

  return {
    data: {
      text: `
        SELECT r.*, e.estado AS nombre_estado
        FROM tbl_requerimiento r
        JOIN tbl_estados e ON e.id_estado = r.id_estado
        ${where}
        ORDER BY r.id_req DESC
        LIMIT ${pageSize} OFFSET ${off};`,
      values
    },
    count: {
      text: `
        SELECT COUNT(*)::int AS total
        FROM tbl_requerimiento r
        ${where};`,
      values
    },
    page, pageSize
  };
}

// ---------- Get ----------
function getById(id) {
  return {
    text: `
      SELECT r.*, e.estado AS nombre_estado
      FROM tbl_requerimiento r
      JOIN tbl_estados e ON e.id_estado = r.id_estado
      WHERE r.id_req = $1;`,
    values: [id]
  };
}

function getByIdForEmpleado(id, id_empleado) {
  return {
    text: `
      SELECT r.*, e.estado AS nombre_estado
      FROM tbl_requerimiento r
      JOIN tbl_estados e ON e.id_estado = r.id_estado
      WHERE r.id_req = $1
        AND EXISTS (
          SELECT 1 FROM tbl_asigna_requerimiento ar
          WHERE ar.id_req = r.id_req AND ar.id_empleado = $2
        );`,
    values: [id, id_empleado]
  };
}

function listEmpleados(id_req) {
  return {
    text: `
      SELECT e.id_empleado, e.cedula_empleado, e.primer_nombre_empl,
             e.segundo_nombre_empl, e.primer_apellido_empl, e.segundo_apellido_empl,
             e.email_empleado
      FROM tbl_asigna_requerimiento ar
      JOIN tbl_empleados_app_sgt_act e ON e.id_empleado = ar.id_empleado
      WHERE ar.id_req = $1
      ORDER BY e.primer_nombre_empl, e.primer_apellido_empl;`,
    values: [id_req]
  };
}

// ---------- Insert ----------
function insert({ descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId }) {
  return {
    text: `
      INSERT INTO tbl_requerimiento
      (descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, id_user_auditoria, fecha_auditoria)
      VALUES ($1,$2,$3,$4,$5,NOW())
      RETURNING id_req;`,
    values: [descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId]
  };
}

function insertAsignacion({ id_req, id_empleado, userId }) {
  return {
    text: `
      INSERT INTO tbl_asigna_requerimiento
      (id_req, id_empleado, id_user_auditoria, fecha_auditoria)
      VALUES ($1,$2,$3,NOW())
      ON CONFLICT DO NOTHING;`,
    values: [id_req, id_empleado, userId]
  };
}

// ---------- Update ----------
function update(id, { descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId }) {
  return {
    text: `
      UPDATE tbl_requerimiento
      SET descripcion_req=$2, fecha_inicio_req=$3, fecha_fin_req=$4,
          id_estado=$5, id_user_auditoria=$6, fecha_auditoria=NOW()
      WHERE id_req=$1;`,
    values: [id, descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId]
  };
}

function listAsignadosIds(id_req) {
  return { text: `SELECT id_empleado FROM tbl_asigna_requerimiento WHERE id_req=$1;`, values: [id_req] };
}

function deleteAsignados(id_req, ids) {
  if (!ids.length) return { text: 'SELECT 1 WHERE false', values: [] };
  const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
  return {
    text: `DELETE FROM tbl_asigna_requerimiento WHERE id_req=$1 AND id_empleado IN (${placeholders});`,
    values: [id_req, ...ids]
  };
}

// ---------- Emails ----------
function emailsByReq(id_req) {
  return {
    text: `
      SELECT e.email_empleado
      FROM tbl_asigna_requerimiento ar
      JOIN tbl_empleados_app_sgt_act e ON e.id_empleado=ar.id_empleado
      WHERE ar.id_req=$1;`,
    values: [id_req]
  };
}

function emailsByIds(ids) {
  if (!ids.length) return { text: 'SELECT 1 WHERE false', values: [] };
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  return {
    text: `SELECT email_empleado FROM tbl_empleados_app_sgt_act WHERE id_empleado IN (${placeholders});`,
    values: ids
  };
}

// ---------- Catálogos ----------
function listEstados() {
  return { text: `SELECT id_estado, estado FROM tbl_estados ORDER BY estado;`, values: [] };
}

// ---------- User/Empleado helpers ----------
function empleadoIdByUserId(userId) {
  return {
    text: `
      SELECT e.id_empleado
      FROM tbl_users u
      JOIN tbl_empleados_app_sgt_act e
        ON e.cedula_empleado = u.cedula_user
      WHERE u.id_user = $1;`,
    values: [userId]
  };
}

function userEmail(userId) {
  return { text: `SELECT email_user FROM tbl_users WHERE id_user=$1;`, values: [userId] };
}

module.exports = {
  list,
  getById,
  getByIdForEmpleado,
  listEmpleados,
  insert,
  insertAsignacion,
  update,
  listAsignadosIds,
  deleteAsignados,
  emailsByReq,
  emailsByIds,
  listEstados,
  empleadoIdByUserId,
  userEmail,
};
