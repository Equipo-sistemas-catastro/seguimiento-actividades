// backend/src/modules/informe-actividades/informe.service.js
const { pool } = require("../../config/db");
const q = require("./informe.queries");

exports.listAniosDisponibles = async (id_user) => {
  const { rows } = await pool.query(q.qAnios, [id_user]);
  return rows.map((r) => r.anio);
};

exports.listMesesDisponibles = async (id_user, anio) => {
  const { rows } = await pool.query(q.qMeses, [id_user, anio]);
  return rows.map((r) => r.mes);
};

exports.generarInformeActividades = async (id_user, anio, mes) => {
  try {
    console.log("🧩 generarInformeActividades() →", { id_user, anio, mes });
    const { rows } = await pool.query(q.qInforme, [id_user, anio, mes]);
    console.log("🧩 generarInformeActividades() → filas:", rows.length);
    return rows;
  } catch (err) {
    console.error("❌ Error en generarInformeActividades:");
    console.error(err);
    throw err; // se propaga al controller
  }
};

