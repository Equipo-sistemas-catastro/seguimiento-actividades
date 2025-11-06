// backend/src/modules/ver-informes/ver-informes.controller.js
const s = require('./ver-informes.service');

exports.buscarEmpleados = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const items = await s.buscarEmpleados(search);
    res.json({ ok: true, items });
  } catch (err) {
    console.error('Error buscarEmpleados:', err);
    res.status(500).json({ error: 'Error buscando empleados' });
  }
};

exports.listAniosDisponibles = async (req, res) => {
  try {
    const id_empleado = Number(req.params.id_empleado);
    const items = await s.listAniosDisponibles(id_empleado);
    res.json({ ok: true, items });
  } catch (err) {
    console.error('Error listAniosDisponibles:', err);
    res.status(500).json({ error: 'Error obteniendo años disponibles' });
  }
};

exports.listMesesDisponibles = async (req, res) => {
  try {
    const id_empleado = Number(req.params.id_empleado);
    const anio = Number(req.params.anio);
    const items = await s.listMesesDisponibles(id_empleado, anio);
    res.json({ ok: true, items });
  } catch (err) {
    console.error('Error listMesesDisponibles:', err);
    res.status(500).json({ error: 'Error obteniendo meses disponibles' });
  }
};

exports.generarInformeActividades = async (req, res) => {
  try {
    const id_empleado = Number(req.query.id_empleado);
    const anio = Number(req.query.anio);
    const mes = Number(req.query.mes);
    const items = await s.generarInformeActividades(id_empleado, anio, mes);
    res.json({ ok: true, items });
  } catch (err) {
    console.error('Error generarInformeActividades:', err);
    res.status(500).json({ error: 'Error generando el informe' });
  }
};

exports.generarPdfInforme = async (req, res) => {
  try {
    const { id_empleado, anio, mes, numInforme, observaciones, dificultades, valorPeriodo } = req.body || {};
    if (!id_empleado || !anio || !mes) return res.status(400).json({ error: 'Faltan parámetros obligatorios' });

    const items = await s.generarInformeActividades(id_empleado, anio, mes);
    if (!Array.isArray(items) || items.length === 0) return res.status(404).json({ error: 'No hay datos para el periodo seleccionado' });

    const pdfBuffer = await s.renderInformeActividadesPdf({
      anio, mes, numInforme, observaciones, dificultades, valorPeriodo,
      contrato: items[0],
      informe: items.map(it => ({
        obligacion_contractual: it.obligacion_contractual,
        descripcion_actividades: it.descripcion_actividades,
        url_evidencia: it.url_evidencia,
      })),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Informe_Actividades_${anio}_${mes}.pdf`);
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Error generarPdfInforme:', err);
    res.status(500).json({ error: 'Error generando el PDF del informe' });
  }
};
