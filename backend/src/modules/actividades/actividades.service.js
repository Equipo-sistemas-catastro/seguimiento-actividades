const { pool } = require('../../config/db');
const Q = require('./actividades.queries');

/** ===================== Util de fechas (robusto a TZ) ===================== **/
function ymdFrom(input) {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) {
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    const d = String(input.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof input === 'string') {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(input);
    if (!isNaN(d.getTime())) return ymdFrom(d);
  }
  return null;
}
function dayNum(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return NaN;
  const [Y, M, D] = ymd.split('-').map(Number);
  return Date.UTC(Y, M - 1, D) / 86400000;
}
function isValidYMD(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
/** ======================================================================== **/

async function getEmpleadoIdOrThrow(userId) {
  const rs = await pool.query(Q.empleadoIdByUserId(userId));
  const idEmpleado = rs.rows?.[0]?.id_empleado ?? null;
  if (!idEmpleado) {
    const err = new Error('El usuario no está relacionado a ningún empleado');
    err.status = 403; throw err;
  }
  return idEmpleado;
}

/**
 * Reglas de fecha:
 * 1) fi_act  >= fi_req
 * 2) fi_act  <= ff_req
 * 3) fi_act  <= ff_prog
 * 4) ff_prog >= fi_req
 * 5) ff_prog >= fi_act
 * 6) ff_prog <= ff_req
 */
function validateFechasActividad({ reqRow, fecha_inicio_actividad, fecha_fin_programada }) {
  const fiActY = ymdFrom(fecha_inicio_actividad);
  const ffProgY = ymdFrom(fecha_fin_programada);
  const fiReqY = ymdFrom(reqRow.fecha_inicio_req);
  const ffReqY = ymdFrom(reqRow.fecha_fin_req);

  if (!isValidYMD(fiActY) || !isValidYMD(ffProgY) || !isValidYMD(fiReqY) || !isValidYMD(ffReqY)) {
    const err = new Error('El requerimiento o las fechas de la actividad no son válidas (YYYY-MM-DD)');
    err.status = 400; throw err;
  }

  const fiAct = dayNum(fiActY);
  const ffProg = dayNum(ffProgY);
  const fiReq = dayNum(fiReqY);
  const ffReq = dayNum(ffReqY);

  if (!(fiAct >= fiReq)) { const err = new Error('La fecha inicio de la actividad debe ser ≥ fecha inicio del requerimiento'); err.status = 400; throw err; }
  if (!(fiAct <= ffReq)) { const err = new Error('La fecha inicio de la actividad debe ser ≤ fecha fin del requerimiento'); err.status = 400; throw err; }
  if (!(fiAct <= ffProg)) { const err = new Error('La fecha inicio de la actividad debe ser ≤ fecha fin programada'); err.status = 400; throw err; }
  if (!(ffProg >= fiReq)) { const err = new Error('La fecha fin programada debe ser ≥ fecha inicio del requerimiento'); err.status = 400; throw err; }
  if (!(ffProg >= fiAct)) { const err = new Error('La fecha fin programada debe ser ≥ fecha inicio de la actividad'); err.status = 400; throw err; }
  if (!(ffProg <= ffReq)) { const err = new Error('La fecha fin programada debe ser ≤ fecha fin del requerimiento'); err.status = 400; throw err; }
}

/** ============================ CREATE ============================ */
async function create(payload = {}, userId = null) {
  const {
    id_req,
    actividad,
    fecha_inicio_actividad,
    fecha_fin_programada,
    id_estado = 1,
    obligaciones,
  } = payload;

  if (!userId) { const e = new Error('Usuario no autenticado'); e.status = 401; throw e; }
  if (!id_req || !Number.isFinite(Number(id_req))) { const e = new Error('id_req es obligatorio y debe ser numérico'); e.status = 400; throw e; }

  const id_empleado = await getEmpleadoIdOrThrow(userId);

  // Verificar requerimiento activo
  const reqRs = await pool.query(Q.getReqCore(Number(id_req)));
  const reqRow = reqRs.rows?.[0] || null;
  if (!reqRow) { const e = new Error('Requerimiento no encontrado'); e.status = 404; throw e; }
  if (Number(reqRow.id_estado) === 3) {
    const e = new Error('El requerimiento está Finalizado; no permite crear actividades'); e.status = 409; throw e;
  }

  // Verificar asignación del requerimiento al empleado
  const chk = await pool.query(Q.checkEmpleadoAsignado(Number(id_req), id_empleado));
  if (!chk.rows?.[0]) { const e = new Error('El requerimiento no está asignado a este empleado'); e.status = 403; throw e; }

  // Validar fechas con reglas de negocio
  const fiActY = ymdFrom(fecha_inicio_actividad);
  const ffProgY = ymdFrom(fecha_fin_programada);
  validateFechasActividad({ reqRow, fecha_inicio_actividad: fiActY, fecha_fin_programada: ffProgY });

  // Validar obligaciones (si vienen)
  let obligacionesIds = [];
  if (Array.isArray(obligaciones)) {
    if (obligaciones.length === 0) {
      const e = new Error('Debes seleccionar al menos una obligación contractual'); e.status = 400; throw e;
    }
    const oblRs = await pool.query(Q.obligacionesByEmpleadoActivo(id_empleado));
    const permitidas = new Set(oblRs.rows.map(r => Number(r.id_obligacion)));
    obligacionesIds = obligaciones.map(Number);
    const invalidas = obligacionesIds.filter(o => !permitidas.has(o));
    if (invalidas.length) {
      const e = new Error('Una o más obligaciones no pertenecen al perfil ACTIVO del empleado'); e.status = 400; throw e;
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ins = await client.query(Q.insertActividad({
      actividad: (actividad || '').trim(),
      fecha_inicio_actividad: fiActY,
      fecha_fin_programada: ffProgY,
      fecha_fin_actividad: null, // al crear no hay fecha de cierre
      id_req: Number(id_req),
      id_empleado,
      id_estado: Number(id_estado) || 1,
      userId,
    }));
    const id_actividad = ins.rows?.[0]?.id_actividad;
    if (!id_actividad) { throw new Error('No se pudo crear la actividad'); }

    if (obligacionesIds.length) {
      await client.query(Q.insertActividadObligaciones(id_actividad, obligacionesIds, userId));
    }

    await client.query('COMMIT');
    return { id_actividad };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** ======================= CATÁLOGO OBLIGACIONES ======================= */
async function listMisObligaciones(userId = null) {
  if (!userId) { const e = new Error('Usuario no autenticado'); e.status = 401; throw e; }
  const id_empleado = await getEmpleadoIdOrThrow(userId);
  const { rows } = await pool.query(Q.obligacionesByEmpleadoActivo(id_empleado));
  return rows || [];
}

/** ============================= LISTAR ============================= */
async function listMisActividades(userId = null, id_req) {
  if (!userId) { const e = new Error('Usuario no autenticado'); e.status = 401; throw e; }
  const id_empleado = await getEmpleadoIdOrThrow(userId);

  // Si viene id_req, mantener comportamiento existente (lista por requerimiento)
  if (id_req !== undefined && id_req !== null && id_req !== '' && !Number.isNaN(Number(id_req))) {
    const { rows } = await pool.query(Q.actividadesByReqEmpleado(Number(id_req), id_empleado));
    return rows || [];
  }

  // Sin id_req → Kanban de "Mis Actividades" (delegado 100% al queries)
  const { rows } = await pool.query(Q.listMisActividadesKanban(id_empleado));
  return rows || [];
}

async function getActividadById(userId = null, id_actividad) {
  if (!userId) { const e = new Error('Usuario no autenticado'); e.status = 401; throw e; }
  const id_empleado = await getEmpleadoIdOrThrow(userId);
  const { rows } = await pool.query(Q.actividadByIdForEmpleado(Number(id_actividad), id_empleado));
  return rows?.[0] || null;
}

/** ============================ UPDATE ============================ */
async function updateActividad(userId = null, id_actividad, body = {}) {
  if (!userId) { const e = new Error('Usuario no autenticado'); e.status = 401; throw e; }
  const id_empleado = await getEmpleadoIdOrThrow(userId);

  const coreRs = await pool.query(Q.actividadCore(Number(id_actividad)));
  const core = coreRs.rows?.[0] || null;
  if (!core || Number(core.id_empleado) !== Number(id_empleado)) {
    const e = new Error('Actividad no encontrada o sin permiso'); e.status = 404; throw e;
  }

  // Si ya está finalizada, no se puede editar
  if (Number(core.id_estado) === 3) {
    const e = new Error('La actividad está finalizada; no se puede editar'); e.status = 409; throw e;
  }

  const actividad = (body.actividad || '').trim();
  const id_estado = Number(body.id_estado) || core.id_estado;
  const id_req = Number(body.id_req || core.id_req);

  // Fechas saneadas
  const fiActY = ymdFrom(body.fecha_inicio_actividad);
  const ffProgY = ymdFrom(body.fecha_fin_programada);

  // Validar requerimiento y reglas de fecha
  const reqRs = await pool.query(Q.getReqCore(Number(id_req)));
  const reqRow = reqRs.rows?.[0] || null;
  if (!reqRow) { const e = new Error('Requerimiento no encontrado'); e.status = 404; throw e; }

  validateFechasActividad({ reqRow, fecha_inicio_actividad: fiActY, fecha_fin_programada: ffProgY });

  // Validar obligaciones si vienen
  let obligaciones = null;
  if (Array.isArray(body.obligaciones)) {
    if (body.obligaciones.length === 0) {
      const e = new Error('Debes seleccionar al menos una obligación contractual'); e.status = 400; throw e;
    }
    const oblRs = await pool.query(Q.obligacionesByEmpleadoActivo(id_empleado));
    const oblPermitidas = new Set(oblRs.rows.map(r => Number(r.id_obligacion)));
    const parsed = body.obligaciones.map(Number);
    const noPermitidas = parsed.filter(id => !oblPermitidas.has(id));
    if (noPermitidas.length) {
      const e = new Error('Una o más obligaciones no pertenecen al perfil ACTIVO del empleado'); e.status = 400; throw e;
    }
    obligaciones = parsed;
  }

  // Si pasa a FINALIZADA, fijamos fecha_fin_actividad = hoy (YYYY-MM-DD)
  const fechaFinActividadY = (id_estado === 3) ? ymdFrom(new Date()) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const up = await client.query(Q.updateActividadBasic({
      id_actividad: Number(id_actividad),
      actividad,
      fecha_inicio_actividad: fiActY,
      fecha_fin_programada: ffProgY,
      id_estado,
      fecha_fin_actividad: fechaFinActividadY, // solo se setea si cambia a 3
      userId,
      id_empleado,
    }));

    if (!up.rows?.[0]?.id_actividad) { throw new Error('No se pudo actualizar la actividad'); }

    if (Array.isArray(obligaciones)) {
      await client.query(Q.deleteActividadObligaciones(Number(id_actividad)));
      if (obligaciones.length) {
        await client.query(Q.insertActividadObligaciones(Number(id_actividad), obligaciones, userId));
      }
    }

    await client.query('COMMIT');
    return { id_actividad: Number(id_actividad) };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  create,
  listMisObligaciones,
  listMisActividades,
  getActividadById,
  updateActividad,
};
