import api from "@/lib/api";

// --------- Listado de requerimientos ----------
export async function fetchRequerimientos({ q = "", estado = null, page = 1, pageSize = 10 } = {}) {
  const params = { q, page, pageSize };
  if (estado != null && estado !== "") params.estado = estado;
  const { data } = await api.get("/requerimientos", { params });
  return {
    items: Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

// --------- Detalle ----------
export async function fetchRequerimientoById(id) {
  const { data } = await api.get(`/requerimientos/${id}`);
  return data || null;
}

// --------- Crear / Actualizar ----------
export async function createRequerimiento(body = {}) {
  const { data } = await api.post("/requerimientos", body);
  const id = data?.id_req ?? data?.id ?? (typeof data === "number" ? data : null);
  if (!id) {
    const err = new Error("createRequerimiento no devolvió id");
    err.response = { data };
    throw err;
  }
  return id;
}

export async function updateRequerimiento(id, body = {}) {
  await api.put(`/requerimientos/${id}`, body);
  return true;
}

// --------- Catálogos ----------
export async function listEstados() {
  const { data } = await api.get("/requerimientos/catalogos/estados");
  const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return rows.map(r => ({
    id: r.id_estado ?? r.id,
    nombre: r.estado ?? r.nombre,
  }));
}

// --------- Empleados ACTIVO (tabla modal) ----------
export async function listEmpleadosActivos({ q = "", page = 1, pageSize = 10 } = {}) {
  try {
    const { data } = await api.get("/empleados", { params: { q, estado: "activo", page, pageSize } });
    return normalizeEmpleadosList(data, page, pageSize);
  } catch (_e) {
    return { items: [], total: 0, page, pageSize };
  }
}

// --------- Empleado por ID (para precargar al editar) ----------
export async function fetchEmpleadoById(id) {
  if (!id) return null;
  const { data } = await api.get(`/empleados/${id}`);
  const raw = data?.empleado ?? data;
  return normalizeEmpleado(raw);
}

// --------- Helpers (compatibles con empleados de contratos) ----------
function joinNonEmpty(arr) {
  return arr.map(v => (v == null ? "" : String(v).trim())).filter(Boolean).join(" ");
}

function normalizeEmpleado(r) {
  if (!r || typeof r !== "object") return null;
  const id = r.id_empleado ?? r.id ?? r.idEmpleado ?? null;
  const cedula = r.cedula_empleado ?? r.cedula ?? r.identificacion ?? "";
  const primer_nombre = r.primer_nombre_empl ?? r.primer_nombre ?? "";
  const segundo_nombre = r.segundo_nombre_empl ?? r.segundo_nombre ?? "";
  const primer_apellido = r.primer_apellido_empl ?? r.primer_apellido ?? "";
  const segundo_apellido = r.segundo_apellido_empl ?? r.segundo_apellido ?? "";
  const nombre = r.nombre_completo || joinNonEmpty([primer_nombre, segundo_nombre, primer_apellido, segundo_apellido]);
  return { id, cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre: nombre || (id != null ? String(id) : "") };
}

function normalizeEmpleadosList(raw, fallbackPage, fallbackPageSize) {
  const rows =
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.items) ? raw.items :
    Array.isArray(raw?.rows) ? raw.rows :
    Array.isArray(raw) ? raw : [];

  const items = rows.map(r => normalizeEmpleado(r)).filter(x => x && x.id != null);
  const total = raw?.total ?? raw?.count ?? items.length;
  const page = raw?.page ?? fallbackPage ?? 1;
  const pageSize = raw?.pageSize ?? fallbackPageSize ?? 10;
  return { items, total, page, pageSize };
}

/* =====================================================
 *  MIS REQUERIMIENTOS + ACTIVIDADES
 * ===================================================== */

// Estados para Kanban de "Mis Requerimientos"
export async function listEstadosMis() {
  const { data } = await api.get("/mis-requerimientos/catalogos/estados");
  const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return rows.map(r => ({ id: r.id_estado ?? r.id, nombre: r.estado ?? r.nombre }));
}

// Listado de "Mis Requerimientos"
export async function fetchMisRequerimientos({ q = "", estado = null, page = 1, pageSize = 10 } = {}) {
  const params = { q, page, pageSize };
  if (estado != null && estado !== "") params.estado = estado;
  const { data } = await api.get("/mis-requerimientos", { params });
  return {
    items: Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

// Detalle de un requerimiento asignado
export async function fetchMisRequerimientoById(id_req) {
  if (!id_req) throw new Error("id_req requerido");
  const { data } = await api.get(`/mis-requerimientos/${id_req}`);
  return data || null;
}

// Catálogo de obligaciones del perfil ACTIVO del empleado logueado
export async function fetchMisObligaciones() {
  const { data } = await api.get("/actividades/catalogos/mis-obligaciones");
  return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
}

// Crear actividad para un requerimiento asignado
export async function createActividad({ id_req, actividad, fecha_inicio_actividad, fecha_fin_programada, id_estado = 1, obligaciones = [] }) {
  if (!id_req) throw new Error("id_req es obligatorio");
  if (!actividad || !actividad.trim()) throw new Error("La descripción de la actividad es obligatoria");
  if (!fecha_inicio_actividad || !fecha_fin_programada) throw new Error("Las fechas son obligatorias");
  if (!Array.isArray(obligaciones) || obligaciones.length === 0) throw new Error("Debe seleccionar al menos una obligación");

  const payload = { id_req, actividad: actividad.trim(), fecha_inicio_actividad, fecha_fin_programada, id_estado, obligaciones };
  const { data } = await api.post("/actividades", payload);
  return data; // { ok: true, id_actividad }
}

/* ====== NUEVO: listar / leer / actualizar actividades del empleado ====== */

// Lista actividades del empleado logueado para un requerimiento
export async function listMisActividades({ id_req }) {
  if (!id_req) return [];
  const { data } = await api.get("/actividades/mis", { params: { id_req } });
  const items =
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data) ? data : [];
  return items;
}

// Detalle de una actividad (incluye obligaciones si backend las retorna)
export async function fetchActividadById(id_actividad) {
  if (!id_actividad) return null;
  const { data } = await api.get(`/actividades/${id_actividad}`);
  return data || null;
}

// Actualizar actividad (solo campos básicos)
export async function updateActividad(id_actividad, body = {}) {
  if (!id_actividad) throw new Error("id_actividad requerido");
  await api.put(`/actividades/${id_actividad}`, body);
  return true;
}
