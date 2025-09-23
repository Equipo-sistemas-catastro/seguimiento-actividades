// backend/src/modules/mis-requerimientos/mis-requerimientos.service.js
const { pool } = require('../../config/db');
const Q = require('../requerimientos/requerimientos.queries');

// Lista SOLO lo asignado al empleado del usuario autenticado
async function list({ q, estado, page, pageSize }, userId) {
  // obtener id_empleado del usuario
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

// Detalle SOLO si el req está asignado al empleado del usuario
async function getById(id, userId) {
  // id_empleado del usuario
  let idEmpleado = null;
  if (userId) {
    const rs = await pool.query(Q.empleadoIdByUserId(userId));
    idEmpleado = rs.rows?.[0]?.id_empleado ?? null;
  }
  if (!idEmpleado) return null;

  const { rows } = await pool.query(Q.getByIdForEmpleado(id, idEmpleado));
  if (!rows[0]) return null;

  const empleados = await pool.query(Q.listEmpleados(id));
  return { ...rows[0], empleados: empleados.rows };
}

// Catálogo de estados
async function listEstados() {
  const { rows } = await pool.query(Q.listEstados());
  return rows;
}

module.exports = { list, getById, listEstados };
