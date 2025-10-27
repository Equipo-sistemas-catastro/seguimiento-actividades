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

// Generar informe completo
r.get("/generar", c.generarInformeActividades);

module.exports = r;
