// backend/src/modules/ver-informes/ver-informes.service.js
const { pool } = require('../../config/db');
const q = require('./ver-informes.queries');

// Reutiliza el renderer del módulo "informe-actividades"
const { renderInformeActividadesPdf } = require('../informe-actividades/informe.service');

exports.buscarEmpleados = async (search) => {
  const s = (search || '').trim();
  const { rows } = await pool.query(q.qBuscarEmpleados, [s]);
  return rows.map(r => ({
    id_empleado: r.id_empleado,
    cedula_empleado: r.cedula_empleado,
    nombre_completo: r.nombre_completo,
  }));
};

exports.listAniosDisponibles = async (id_empleado) => {
  const { rows } = await pool.query(q.qAniosByEmpleado, [id_empleado]);
  return rows.map(r => r.anio);
};

exports.listMesesDisponibles = async (id_empleado, anio) => {
  const { rows } = await pool.query(q.qMesesByEmpleado, [id_empleado, anio]);
  return rows.map(r => r.mes);
};

exports.generarInformeActividades = async (id_empleado, anio, mes) => {
  const { rows } = await pool.query(q.qInformeByEmpleado, [id_empleado, anio, mes]);
  return rows;
};

exports.renderInformeActividadesPdf = async (payload) => {
  return renderInformeActividadesPdf(payload);
};
