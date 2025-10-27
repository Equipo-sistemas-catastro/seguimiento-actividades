// backend/src/modules/informe-actividades/informe.controller.js
const s = require("./informe.service");

exports.listAniosDisponibles = async (req, res) => {
  try {
    const id_user = req.user.id; // ✅ corregido
    const data = await s.listAniosDisponibles(id_user);
    res.json({ ok: true, items: data });
  } catch (err) {
    console.error("Error listAniosDisponibles:", err);
    res.status(500).json({ error: "Error obteniendo años disponibles" });
  }
};

exports.listMesesDisponibles = async (req, res) => {
  try {
    const id_user = req.user.id; // ✅ corregido
    const { anio } = req.params;
    const data = await s.listMesesDisponibles(id_user, anio);
    res.json({ ok: true, items: data });
  } catch (err) {
    console.error("Error listMesesDisponibles:", err);
    res.status(500).json({ error: "Error obteniendo meses disponibles" });
  }
};

exports.generarInformeActividades = async (req, res) => {
  try {
    const id_user = req.user.id; // ✅ corregido
    const { anio, mes } = req.query;
    const data = await s.generarInformeActividades(id_user, anio, mes);
    res.json({ ok: true, items: data });
  } catch (err) {
    console.error("Error generarInformeActividades:", err);
    res.status(500).json({ error: "Error generando el informe" });
  }
};
