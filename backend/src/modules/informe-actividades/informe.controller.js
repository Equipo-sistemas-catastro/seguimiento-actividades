// backend/src/modules/informe-actividades/informe.controller.js
const s = require("./informe.service");

exports.listAniosDisponibles = async (req, res) => {
  try {
    const id_user = req.user.id;
    const data = await s.listAniosDisponibles(id_user);
    res.json({ ok: true, items: data });
  } catch (err) {
    console.error("Error listAniosDisponibles:", err);
    res.status(500).json({ error: "Error obteniendo años disponibles" });
  }
};

exports.listMesesDisponibles = async (req, res) => {
  try {
    const id_user = req.user.id;
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
    const id_user = req.user.id;
    const { anio, mes } = req.query;
    const data = await s.generarInformeActividades(id_user, anio, mes);
    res.json({ ok: true, items: data });
  } catch (err) {
    console.error("Error generarInformeActividades:", err);
    res.status(500).json({ error: "Error generando el informe" });
  }
};

// ===== PDF (HTML → PDF con hipervínculos) =====
exports.generarPdfInforme = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { anio, mes, numInforme, observaciones, dificultades, valorPeriodo } = req.body || {};
    if (!anio || !mes) return res.status(400).json({ error: "Faltan parámetros anio/mes" });

    const items = await s.generarInformeActividades(id_user, anio, mes);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(404).json({ error: "No hay datos para el periodo seleccionado" });
    }

    const pdfBuffer = await s.renderInformeActividadesPdf({
      anio, mes, numInforme, observaciones, dificultades, valorPeriodo,
      contrato: items[0],
      informe: items.map(it => ({
        obligacion_contractual: it.obligacion_contractual,
        descripcion_actividades: it.descripcion_actividades,
        url_evidencia: it.url_evidencia,
      })),
    });

    // 🔒 Enviar binario puro (evita corrupción)
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Informe_Actividades_${anio}_${mes}.pdf`);
    res.setHeader("Content-Length", Buffer.byteLength(pdfBuffer));
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Error generarPdfInforme:", err);
    res.status(500).json({ error: "Error generando el PDF del informe" });
  }
};
