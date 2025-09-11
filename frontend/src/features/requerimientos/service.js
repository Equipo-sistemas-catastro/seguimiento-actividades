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
  // backend devuelve { ...campos, empleados:[...] }
  return data || null;
}

// --------- Crear / Actualizar ----------
export async function createRequerimiento(body = {}) {
  // body: { descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, empleados: [ids] }
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
  // backend retorna [{ id_estado, estado }]
  const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return rows.map(r => ({
    id: r.id_estado ?? r.id,
    nombre: r.estado ?? r.nombre,
  }));
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
  const raw = data?.empleado ?? data;
  return normalizeEmpleado(raw);
}

// --------- Helpers (compatibles con empleados de contratos) ----------
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
