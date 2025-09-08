// src/features/contratos/service.js
import api from "@/lib/api";

// --------- Listado de contratos ----------
export async function fetchContratos({ q = "", page = 1, pageSize = 10 } = {}) {
  const { data } = await api.get("/contratos", { params: { q, page, pageSize } });
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

// --------- Detalle ----------
export async function fetchContratoById(id) {
  const { data } = await api.get(`/contratos/${id}`);
  return data || null;
}

// --------- Crear / Actualizar ----------
export async function createContrato(body = {}) {
  const { data } = await api.post("/contratos", body);
  const id = data?.id_contrato ?? data?.id ?? (typeof data === "number" ? data : null);
  if (!id) {
    const err = new Error("createContrato no devolvió id");
    err.response = { data };
    throw err;
  }
  return id;
}

export async function updateContrato(id, body = {}) {
  await api.put(`/contratos/${id}`, body);
  return true;
}

// --------- Catálogos ----------
export async function listTiposContrato() {
  const { data } = await api.get("/contratos/catalogos/tipos-contrato");
  return Array.isArray(data) ? data : [];
}

export async function listEntidades() {
  const { data } = await api.get("/contratos/catalogos/entidades");
  return Array.isArray(data) ? data : [];
}

// --------- Empleados ACTIVO (tabla modal) ----------
export async function listEmpleadosActivos({ q = "", page = 1, pageSize = 10 } = {}) {
  try {
    const { data } = await api.get("/empleados", {
      params: { q, estado: "activo", page, pageSize },
    });
    return normalizeEmpleadosList(data, page, pageSize);
  } catch (_e) {
    return { items: [], total: 0, page, pageSize };
  }
}

// --------- Empleado por ID (para precargar al editar) ----------
export async function fetchEmpleadoById(id) {
  if (!id) return null;
  const { data } = await api.get(`/empleados/${id}`);
  // Soporta tanto { empleado: {...} } como objeto plano
  const raw = data?.empleado ?? data;
  return normalizeEmpleado(raw);
}

// --------- Helpers ----------
function joinNonEmpty(arr) {
  return arr
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(" ");
}

function normalizeEmpleado(r) {
  if (!r || typeof r !== "object") return null;

  const id = r.id_empleado ?? r.id ?? r.idEmpleado ?? null;
  const cedula = r.cedula_empleado ?? r.cedula ?? r.identificacion ?? "";

  const primer_nombre = r.primer_nombre_empl ?? r.primer_nombre ?? "";
  const segundo_nombre = r.segundo_nombre_empl ?? r.segundo_nombre ?? "";
  const primer_apellido = r.primer_apellido_empl ?? r.primer_apellido ?? "";
  const segundo_apellido = r.segundo_apellido_empl ?? r.segundo_apellido ?? "";

  const nombre =
    r.nombre_completo ||
    joinNonEmpty([primer_nombre, segundo_nombre, primer_apellido, segundo_apellido]);

  return {
    id,
    cedula,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    nombre: nombre || (id != null ? String(id) : ""),
  };
}

function normalizeEmpleadosList(raw, fallbackPage, fallbackPageSize) {
  const rows =
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.items) ? raw.items :
    Array.isArray(raw?.rows) ? raw.rows :
    Array.isArray(raw) ? raw : [];

  const items = rows
    .map((r) => normalizeEmpleado(r))
    .filter((x) => x && x.id != null);

  const total = raw?.total ?? raw?.count ?? items.length;
  const page = raw?.page ?? fallbackPage ?? 1;
  const pageSize = raw?.pageSize ?? fallbackPageSize ?? 10;

  return { items, total, page, pageSize };
}
