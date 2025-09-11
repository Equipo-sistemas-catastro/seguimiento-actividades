// backend/src/modules/requerimientos/requerimientos.service.js
const { pool } = require('../../config/db');
const Q = require('./requerimientos.queries');
const { sendEmail } = require('../../utils/mailer');

// ---------- Utils ----------
function isValidDateStr(s) {
  if (!s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

// ---------- Service ----------
async function list({ q, estado, page, pageSize }, userId) {
  // obtener el id_empleado del usuario logueado (por cédula)
  let idEmpleado = null;
  if (userId) {
    const rs = await pool.query(Q.empleadoIdByUserId(userId));
    idEmpleado = rs.rows?.[0]?.id_empleado ?? null;
  }

  // Si el usuario no está relacionado con ningún empleado => no ve nada
  if (!idEmpleado) {
    return { items: [], total: 0, page: Number(page) || 1, pageSize: Math.min(Number(pageSize) || 10, 100) };
  }

  const built = Q.list({ q, estado, page, pageSize, assignedEmpleadoId: idEmpleado });
  const [rowsRes, countRes] = await Promise.all([
    pool.query(built.data),
    pool.query(built.count),
  ]);
  return {
    items: rowsRes.rows,
    total: countRes.rows?.[0]?.total ?? 0,
    page: built.page,
    pageSize: built.pageSize,
  };
}

async function getById(id) {
  const { rows } = await pool.query(Q.getById(id));
  if (!rows[0]) return null;
  const empleados = await pool.query(Q.listEmpleados(id));
  return { ...rows[0], empleados: empleados.rows };
}

async function create(payload, userId = null) {
  const {
    descripcion_req,
    fecha_inicio_req,
    fecha_fin_req,
    id_estado,
    empleados = [], // ahora opcional; agregamos por defecto el creador
  } = payload || {};

  if (!descripcion_req || !fecha_inicio_req || !fecha_fin_req || !id_estado) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400; throw err;
  }
  if (!isValidDateStr(fecha_inicio_req) || !isValidDateStr(fecha_fin_req)) {
    const err = new Error('Formato de fecha inválido');
    err.status = 400; throw err;
  }

  // id_empleado del creador (si existe relación por cédula)
  let idEmpleadoCreador = null;
  if (userId) {
    const rs = await pool.query(Q.empleadoIdByUserId(userId));
    idEmpleadoCreador = rs.rows?.[0]?.id_empleado ?? null;
  }
  const empleadosFinal = uniq([...(empleados || []), idEmpleadoCreador]);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(Q.insert({
      descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId,
    }));
    const id_req = rows[0].id_req;

    for (const id_empleado of empleadosFinal) {
      await client.query(Q.insertAsignacion({ id_req, id_empleado, userId }));
    }
    await client.query('COMMIT');

    // correos a empleados asignados + creador (si tiene email)
    const mailsEmp = await pool.query(Q.emailsByReq(id_req));
    const mailsSet = new Set(mailsEmp.rows.map(r => r.email_empleado).filter(Boolean));

    if (userId) {
      const u = await pool.query(Q.userEmail(userId));
      const emailUser = u.rows?.[0]?.email_user;
      if (emailUser) mailsSet.add(emailUser);
    }

    if (mailsSet.size) {
      await sendEmail({
        to: Array.from(mailsSet),
        subject: `Nuevo requerimiento #${id_req}`,
        html: `<p>Se creó un nuevo requerimiento: <b>${descripcion_req}</b></p>`,
      });
    }

    return id_req;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function update(id, payload, userId = null) {
  const {
    descripcion_req,
    fecha_inicio_req,
    fecha_fin_req,
    id_estado,
    empleados = null, // si viene null no toca asignaciones
  } = payload || {};

  if (!descripcion_req || !fecha_inicio_req || !fecha_fin_req || !id_estado) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400; throw err;
  }

  if (!isValidDateStr(fecha_inicio_req) || !isValidDateStr(fecha_fin_req)) {
    const err = new Error('Formato de fecha inválido');
    err.status = 400; throw err;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(Q.update(id, {
      descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, userId,
    }));

    let removed = [], added = [];
    if (Array.isArray(empleados)) {
      const current = await client.query(Q.listAsignadosIds(id));
      const actuales = current.rows.map(r => r.id_empleado);

      // Garantizar que el creador permanezca asignado (por regla)
      let idEmpleadoCreador = null;
      if (userId) {
        const rs = await client.query(Q.empleadoIdByUserId(userId));
        idEmpleadoCreador = rs.rows?.[0]?.id_empleado ?? null;
      }
      const empleFinal = uniq([...(empleados || []), idEmpleadoCreador]);

      removed = actuales.filter(x => !empleFinal.includes(x));
      added = empleFinal.filter(x => !actuales.includes(x));

      if (removed.length) {
        await client.query(Q.deleteAsignados(id, removed));
      }
      for (const id_empleado of added) {
        await client.query(Q.insertAsignacion({ id_req: id, id_empleado, userId }));
      }
    }
    await client.query('COMMIT');

    // correos
    if (removed.length) {
      const mailsRemoved = await pool.query(Q.emailsByIds(removed));
      if (mailsRemoved.rows.length) {
        await sendEmail({
          to: mailsRemoved.rows.map(r => r.email_empleado),
          subject: `Retiro de requerimiento #${id}`,
          html: `<p>Ya no tienes asignado el requerimiento: ${descripcion_req}</p>`,
        });
      }
    }
    if (added.length) {
      const mails = await pool.query(Q.emailsByReq(id));
      if (mails.rows.length) {
        await sendEmail({
          to: mails.rows.map(r => r.email_empleado),
          subject: `Asignaciones actualizadas requerimiento #${id}`,
          html: `<p>Se actualizó la asignación de empleados para el requerimiento: ${descripcion_req}</p>`,
        });
      }
    }

    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function listEstados() {
  const { rows } = await pool.query(Q.listEstados());
  return rows;
}

module.exports = {
  list,
  getById,
  create,
  update,
  listEstados,
};
