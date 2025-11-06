// backend/src/modules/informe-actividades/informe.routes.js
const r = require("express").Router();
const { requireAuth } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const c = require("./informe.controller");

r.use(requireAuth);
r.use(authorize("INFORME_ACTIVIDADES"));

// Catálogos de años y meses disponibles
r.get("/catalogos/anios", c.listAniosDisponibles);
r.get("/catalogos/meses/:anio", c.listMesesDisponibles);

// Generar informe (datos)
r.get("/generar", c.generarInformeActividades);

// Generar PDF (HTML→PDF con enlaces clicables)
r.post("/pdf", c.generarPdfInforme);

module.exports = r;
