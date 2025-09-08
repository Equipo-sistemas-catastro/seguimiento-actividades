const { pool } = require('../../config/db');
const Q = require('./contratos.queries');

// ---------- Utils ----------
function isValidDateStr(s) {
  if (!s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

function calcDuracion(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || e < s) return null;
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  let anchor = new Date(s.getFullYear(), s.getMonth() + months, s.getDate());
  if (anchor > e) {
    months -= 1;
    anchor = new Date(s.getFullYear(), s.getMonth() + months, s.getDate());
  }
  const MS_DAY = 24 * 60 * 60 * 1000;
  const days = Math.floor((e - anchor) / MS_DAY);
  return `${months} meses, ${days} días`;
}

// ---------- Service ----------
async function list({ q, page, pageSize }) {
  const built = Q.list({ q, page, pageSize });
  const [rowsRes, countRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count),
  ]);

  const items = rowsRes.rows.map((r) => ({
    id_contrato: r.id_contrato,
    num_contrato: r.num_contrato,
    fecha_inicio_contrato: r.fecha_inicio_contrato,
    fecha_fin_contrato: r.fecha_fin_contrato,
    valor_contrato: r.valor_contrato,
    supervisor_contrato: r.supervisor_contrato,
    id_tipo_contrato: r.id_tipo_contrato,
    id_entidad: r.id_entidad,
    id_empleado: r.id_empleado,
    cedula_empleado: r.cedula_empleado ?? null, // ⬅️ nuevo para la tabla
    id_user_auditoria: r.id_user_auditoria,
    fecha_auditoria: r.fecha_auditoria,
    duracion: calcDuracion(r.fecha_inicio_contrato, r.fecha_fin_contrato), // informativo
  }));

  return {
    items,
    total: countRes.rows?.[0]?.total ?? 0,
    page: built.page,
    pageSize: built.pageSize,
  };
}

async function getById(id) {
  const { rows } = await pool.query(Q.getById(id));
  if (!rows[0]) return null;

  const r = rows[0];
  return {
    id_contrato: r.id_contrato,
    num_contrato: r.num_contrato,
    fecha_inicio_contrato: r.fecha_inicio_contrato,
    fecha_fin_contrato: r.fecha_fin_contrato,
    valor_contrato: r.valor_contrato,
    supervisor_contrato: r.supervisor_contrato,
    id_tipo_contrato: r.id_tipo_contrato,
    id_entidad: r.id_entidad,
    id_empleado: r.id_empleado,
    id_user_auditoria: r.id_user_auditoria,
    fecha_auditoria: r.fecha_auditoria,
    duracion: calcDuracion(r.fecha_inicio_contrato, r.fecha_fin_contrato), // informativo
  };
}

async function create(payload, userId = null) {
  const {
    num_contrato,
    fecha_inicio_contrato,
    fecha_fin_contrato,
    valor_contrato,
    supervisor_contrato,
    id_tipo_contrato,
    id_entidad,
    id_empleado,
  } = payload || {};

  if (!num_contrato || !id_tipo_contrato || !id_entidad || !id_empleado) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400;
    throw err;
  }

  if (fecha_inicio_contrato && fecha_fin_contrato) {
    if (!isValidDateStr(fecha_inicio_contrato) || !isValidDateStr(fecha_fin_contrato)) {
      const err = new Error('Formato de fecha inválido');
      err.status = 400;
      throw err;
    }
    if (new Date(fecha_fin_contrato) < new Date(fecha_inicio_contrato)) {
      const err = new Error('La fecha fin debe ser mayor o igual a la fecha inicio');
      err.status = 400;
      throw err;
    }
  }

  const [emp, tipo, ent] = await Promise.all([
    pool.query(Q.verifyEmpleado(id_empleado)),
    pool.query(Q.verifyTipoContrato(id_tipo_contrato)),
    pool.query(Q.verifyEntidad(id_entidad)),
  ]);
  if (!emp.rowCount) {
    const err = new Error('Empleado no existe');
    err.status = 400;
    throw err;
  }
  if (!tipo.rowCount) {
    const err = new Error('Tipo de contrato no existe');
    err.status = 400;
    throw err;
  }
  if (!ent.rowCount) {
    const err = new Error('Entidad contratante no existe');
    err.status = 400;
    throw err;
  }

  try {
    const { rows } = await pool.query(
      Q.insert({
        num_contrato,
        fecha_inicio_contrato,
        fecha_fin_contrato,
        valor_contrato,
        supervisor_contrato,
        id_tipo_contrato,
        id_entidad,
        id_empleado,
        userId,
      })
    );
    const id = rows?.[0]?.id_contrato;
    if (!id) {
      const err = new Error('No se pudo obtener id_contrato al crear');
      err.status = 500;
      throw err;
    }
    return id;
  } catch (e) {
    if (e.code === '23505') e.status = 409;
    else if (e.code === '23503') e.status = 400;
    throw e;
  }
}

async function update(id, payload, userId = null) {
  const {
    num_contrato,
    fecha_inicio_contrato,
    fecha_fin_contrato,
    valor_contrato,
    supervisor_contrato,
    id_tipo_contrato,
    id_entidad,
    id_empleado,
  } = payload || {};

  if (!num_contrato || !id_tipo_contrato || !id_entidad || !id_empleado) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400;
    throw err;
  }

  if (fecha_inicio_contrato && fecha_fin_contrato) {
    if (!isValidDateStr(fecha_inicio_contrato) || !isValidDateStr(fecha_fin_contrato)) {
      const err = new Error('Formato de fecha inválido');
      err.status = 400;
      throw err;
    }
    if (new Date(fecha_fin_contrato) < new Date(fecha_inicio_contrato)) {
      const err = new Error('La fecha fin debe ser mayor o igual a la fecha inicio');
      err.status = 400;
      throw err;
    }
  }

  const [emp, tipo, ent] = await Promise.all([
    pool.query(Q.verifyEmpleado(id_empleado)),
    pool.query(Q.verifyTipoContrato(id_tipo_contrato)),
    pool.query(Q.verifyEntidad(id_entidad)),
  ]);
  if (!emp.rowCount) {
    const err = new Error('Empleado no existe');
    err.status = 400;
    throw err;
  }
  if (!tipo.rowCount) {
    const err = new Error('Tipo de contrato no existe');
    err.status = 400;
    throw err;
  }
  if (!ent.rowCount) {
    const err = new Error('Entidad contratante no existe');
    err.status = 400;
    throw err;
  }

  try {
    const r = await pool.query(
      Q.update(id, {
        num_contrato,
        fecha_inicio_contrato,
        fecha_fin_contrato,
        valor_contrato,
        supervisor_contrato,
        id_tipo_contrato,
        id_entidad,
        id_empleado,
        userId,
      })
    );
    if (r.rowCount === 0) {
      const err = new Error('Contrato no encontrado');
      err.status = 404;
      throw err;
    }
    return true;
  } catch (e) {
    if (e.code === '23505') e.status = 409;
    else if (e.code === '23503') e.status = 400;
    throw e;
  }
}

// ---------- Catálogos ----------
async function listTiposContrato() {
  const { rows } = await pool.query(Q.listTiposContrato());
  return rows;
}

async function listEntidades() {
  const { rows } = await pool.query(Q.listEntidades());
  return rows;
}

module.exports = {
  list,
  getById,
  create,
  update,
  listTiposContrato,
  listEntidades,
};
