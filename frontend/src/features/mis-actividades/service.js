// Servicios de frontend para "Mis Actividades"
// Depende del axios preconfigurado en "@/lib/api"

import api from "@/lib/api";

/* ============================
 * Helpers
 * ============================ */
function toArrayMaybe(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
function toId(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}
function ensureYYYYMMDD(d) {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const da = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function pickActividadFromDetail(resp) {
  // Soporta { ok, item } o el row directo
  const r = resp?.item ?? resp ?? {};

  // Normalizar obligaciones a array de ids
  let obligaciones = undefined;
  if (Array.isArray(r.obligaciones) && r.obligaciones.length) {
    obligaciones = r.obligaciones
      .map(o => toId(o.id_obligacion))
      .filter(Boolean);
  } else if (Array.isArray(r.actividad_obligaciones) && r.actividad_obligaciones.length) {
    obligaciones = r.actividad_obligaciones
      .map(o => toId(o?.id_obligacion ?? o))
      .filter(Boolean);
  }

  return {
    id_actividad: toId(r.id_actividad),
    actividad: r.actividad ?? "",
    id_req: toId(r.id_req),
    id_estado: toId(r.id_estado),
    fecha_inicio_actividad: r.fecha_inicio_actividad ?? null,
    fecha_fin_programada: r.fecha_fin_programada ?? null,
    fecha_fin_actividad: r.fecha_fin_actividad ?? null,
    obligaciones, // ids o undefined si no vino
  };
}

/* ============================
 * Catálogos
 * ============================ */

// Estados (reutiliza catálogo de "Mis Requerimientos")
export async function listEstadosActividades() {
  const { data } = await api.get("/mis-requerimientos/catalogos/estados");
  const rows = toArrayMaybe(data);
  return rows.map((r) => ({
    id_estado: toId(r.id_estado ?? r.id),
    estado: r.estado ?? r.nombre ?? "",
  }));
}

// Obligaciones del perfil ACTIVO del empleado logueado
export async function fetchMisObligaciones() {
  const { data } = await api.get("/actividades/catalogos/mis-obligaciones");
  return toArrayMaybe(data).map((o) => ({
    id_obligacion: toId(o.id_obligacion),
    obligacion_contractual: o.obligacion_contractual ?? "",
  }));
}

/* ============================
 * Mis Requerimientos (modal)
 * ============================ */

export async function listMisRequerimientosAsignados({ q = "", page = 1, pageSize = 10, estado } = {}) {
  const params = { q, page, pageSize };
  if (estado !== undefined && estado !== null && `${estado}` !== "") params.estado = estado;

  const { data } = await api.get("/mis-requerimientos", { params });
  const items = toArrayMaybe(data).map((r) => ({
    id_req: toId(r.id_req),
    descripcion_req: r.descripcion_req ?? r.descripcion ?? "",
    fecha_inicio_req: r.fecha_inicio_req ?? null,
    fecha_fin_req: r.fecha_fin_req ?? null,
    id_estado: toId(r.id_estado),
    estado: r.estado ?? r.nombre_estado ?? null,
  }));

  return {
    items,
    total: toId(data?.total) ?? items.length,
    page: toId(data?.page) ?? page,
    pageSize: toId(data?.pageSize) ?? pageSize,
  };
}

/* ============================
 * Mis Actividades (Kanban)
 * ============================ */

// Kanban
export async function fetchMisActividadesKanban() {
  const { data } = await api.get("/actividades/mis");
  const rows = toArrayMaybe(data);
  return rows.map((a) => ({
    id_actividad: toId(a.id_actividad),
    actividad: a.actividad ?? "",
    fecha_inicio_actividad: a.fecha_inicio_actividad ?? null,
    fecha_fin_programada: a.fecha_fin_programada ?? null,
    fecha_fin_actividad: a.fecha_fin_actividad ?? null,
    id_estado: toId(a.id_estado),
    nombre_estado: a.nombre_estado ?? a.estado ?? "",
    id_req: toId(a.id_req),
    descripcion_req: a.descripcion_req ?? "",
    incumplida: Boolean(a.incumplida),
    finalizada_incumplida: Boolean(a.finalizada_incumplida),
  }));
}

/* ============================
 * CRUD Actividades
 * ============================ */

// Crear actividad
export async function createActividad({ id_req, actividad, fecha_inicio_actividad, fecha_fin_programada, id_estado = 1, obligaciones = [] }) {
  if (!id_req) throw new Error("id_req es obligatorio");
  if (!actividad || !actividad.trim()) throw new Error("La descripción de la actividad es obligatoria");
  if (!fecha_inicio_actividad || !fecha_fin_programada) throw new Error("Las fechas son obligatorias");
  if (!Array.isArray(obligaciones) || obligaciones.length === 0) throw new Error("Debe seleccionar al menos una obligación");

  const payload = {
    id_req,
    actividad: actividad.trim(),
    fecha_inicio_actividad: ensureYYYYMMDD(fecha_inicio_actividad),
    fecha_fin_programada: ensureYYYYMMDD(fecha_fin_programada),
    id_estado,
    obligaciones,
  };
  const { data } = await api.post("/actividades", payload);
  return data; // { ok: true, id_actividad }
}

// Lista de actividades por requerimiento (si lo necesitas)
export async function listMisActividades({ id_req }) {
  if (!id_req) return [];
  const { data } = await api.get("/actividades/mis", { params: { id_req } });
  const items =
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data) ? data : [];
  return items;
}

// Detalle por ID
export async function fetchActividadById(id_actividad) {
  if (!id_actividad) return null;
  const { data } = await api.get(`/actividades/${id_actividad}`);
  return data || null;
}

/**
 * Arma body final para PUT:
 * - Completa campos faltantes consultando el detalle actual (GET)
 * - Asegura fechas YYYY-MM-DD
 * - Incluye SIEMPRE obligaciones (si caller no las pasa, usa las actuales)
 * - Si id_estado === 3 (Finalizada), agrega fecha_fin_actividad = hoy
 */
async function buildFinalUpdateBody(id_actividad, body = {}) {
  const needs = ["actividad", "id_req", "fecha_inicio_actividad", "fecha_fin_programada"];
  const missing = needs.filter(k => body[k] == null || body[k] === "");

  const detail = await fetchActividadById(id_actividad);
  const base = pickActividadFromDetail(detail);

  const finalBody = {
    actividad: missing.includes("actividad") ? base.actividad : body.actividad,
    id_req: missing.includes("id_req") ? base.id_req : body.id_req,
    fecha_inicio_actividad: ensureYYYYMMDD(
      missing.includes("fecha_inicio_actividad") ? base.fecha_inicio_actividad : body.fecha_inicio_actividad
    ),
    fecha_fin_programada: ensureYYYYMMDD(
      missing.includes("fecha_fin_programada") ? base.fecha_fin_programada : body.fecha_fin_programada
    ),
    id_estado: toId(body.id_estado ?? base.id_estado),
  };

  // Obligaciones:
  if (Array.isArray(body.obligaciones)) {
    finalBody.obligaciones = body.obligaciones.map(toId).filter(Boolean);
  } else if (Array.isArray(base.obligaciones) && base.obligaciones.length) {
    finalBody.obligaciones = base.obligaciones;
  } else {
    finalBody.obligaciones = []; // si realmente no hay
  }

  // Si Finalizada (3) y no viene fecha de fin, poner hoy
  if (toId(finalBody.id_estado) === 3 && !body.fecha_fin_actividad) {
    finalBody.fecha_fin_actividad = todayYMD();
  }

  return finalBody;
}

// Update “smart”: completa body parcial con detalle actual
export async function updateActividad(id_actividad, body = {}) {
  if (!id_actividad) throw new Error("id_actividad requerido");
  const finalBody = await buildFinalUpdateBody(id_actividad, body);
  await api.put(`/actividades/${id_actividad}`, finalBody);
  return true;
}

// Mover estado desde Kanban: manda payload completo + obligaciones + fecha_fin_actividad si va a 3
export async function moveActividadEstado(id_actividad, id_estado_destino) {
  if (!id_actividad || !id_estado_destino) throw new Error("Parámetros inválidos");
  const body = await buildFinalUpdateBody(id_actividad, { id_estado: toId(id_estado_destino) });
  await api.put(`/actividades/${id_actividad}`, body);
  return true;
}
