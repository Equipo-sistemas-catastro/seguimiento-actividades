// src/features/empleados/service.js
import api from "@/lib/api";

/** Normaliza un empleado del backend a la UI */
function normalizeEmpleado(row = {}) {
  const nombre = [
    row.primer_nombre_empl,
    row.segundo_nombre_empl,
    row.primer_apellido_empl,
    row.segundo_apellido_empl,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    id:
      row.id_empleado != null
        ? Number(row.id_empleado)
        : row.id != null
        ? Number(row.id)
        : null,
    cedula: row.cedula_empleado ?? row.cedula ?? "",
    nombre,
    email: row.email_empleado ?? row.email ?? "",
    movil: row.movil_empleado ?? row.movil ?? "",
    estado:
      (row.estado ?? "").toString().toLowerCase() === "inactivo"
        ? "inactivo"
        : "activo",

    // para formulario
    primer_nombre_empl: row.primer_nombre_empl ?? "",
    segundo_nombre_empl: row.segundo_nombre_empl ?? "",
    primer_apellido_empl: row.primer_apellido_empl ?? "",
    segundo_apellido_empl: row.segundo_apellido_empl ?? "",
    fecha_nacimiento_empl: row.fecha_nacimiento_empl ?? null,

    fecha_auditoria: row.fecha_auditoria ?? null,
    _raw: row,
  };
}

/** Listado paginado de empleados */
export async function fetchEmpleados({
  q = "",
  estado = "",
  page = 1,
  pageSize = 10,
  sortBy = "id_empleado",
  sortDir = "DESC",
} = {}) {
  const params = { q, estado, page, pageSize, sortBy, sortDir };
  const { data } = await api.get("/empleados", { params });

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  return {
    items: rows.map(normalizeEmpleado),
    total: data?.total ?? rows.length,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

/** Detalle de empleado: { empleado, perfiles_activos, componentes_activos, ... } */
export async function getEmpleadoDetalle(id) {
  if (!id) return null;
  const { data } = await api.get(`/empleados/${id}`);
  const payload = data?.data ?? data ?? {};
  const empleado = payload?.empleado ?? null;
  if (!empleado) return null;

  const norm = normalizeEmpleado(empleado);
  const perfilActivo = Array.isArray(payload?.perfiles_activos)
    ? payload.perfiles_activos[0]
    : null;
  const componenteActivo = Array.isArray(payload?.componentes_activos)
    ? payload.componentes_activos[0]
    : null;

  return {
    ...norm,
    perfil_id: perfilActivo?.id_perfil
      ? Number(perfilActivo.id_perfil)
      : undefined,
    componente_id: componenteActivo?.id_componente
      ? Number(componenteActivo.id_componente)
      : undefined,
  };
}

/** Crear empleado */
export async function createEmpleado(payload) {
  const body = {
    cedula_empleado: payload.cedula?.trim(),
    primer_nombre_empl: payload.primer_nombre_empl?.trim(),
    segundo_nombre_empl: payload.segundo_nombre_empl?.trim() || null,
    primer_apellido_empl: payload.primer_apellido_empl?.trim(),
    segundo_apellido_empl: payload.segundo_apellido_empl?.trim() || null,
    fecha_nacimiento_empl: payload.fecha_nacimiento_empl || null,
    email_empleado: payload.email?.trim() || null,
    movil_empleado: payload.movil?.trim() || null,
    estado: payload.estado,
  };
  const { data } = await api.post("/empleados", body);
  const created = data?.data ?? data ?? {};
  return normalizeEmpleado(created);
}

/** Actualizar empleado */
export async function updateEmpleado(id, payload) {
  const body = {
    cedula_empleado: payload.cedula?.trim(),
    primer_nombre_empl: payload.primer_nombre_empl?.trim(),
    segundo_nombre_empl: payload.segundo_nombre_empl?.trim() || null,
    primer_apellido_empl: payload.primer_apellido_empl?.trim(),
    segundo_apellido_empl: payload.segundo_apellido_empl?.trim() || null,
    fecha_nacimiento_empl: payload.fecha_nacimiento_empl || null,
    email_empleado: payload.email?.trim() || null,
    movil_empleado: payload.movil?.trim() || null,
    estado: payload.estado,
  };
  const { data } = await api.put(`/empleados/${id}`, body);
  const updated = data?.data ?? data ?? {};
  return normalizeEmpleado(updated);
}

/** ===== Catálogos (cargar TODO para selects) ===== */
export async function fetchPerfilesAll() {
  const { data } = await api.get("/perfiles", {
    params: { page: 1, pageSize: 500 },
  });
  const rows = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
  return rows.map((r) => ({
    id: Number(r.id_perfil ?? r.id),
    label: r.perfil,
    value: Number(r.id_perfil ?? r.id),
  }));
}

export async function fetchComponentesAll() {
  const { data } = await api.get("/componentes", {
    params: { page: 1, pageSize: 500, sortBy: "componente", sortDir: "asc" },
  });
  const rows = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
  return rows.map((r) => ({
    id: Number(r.id_componente ?? r.id),
    label: r.componente,
    value: Number(r.id_componente ?? r.id),
  }));
}

/** ===== Asignaciones (histórico en backend) ===== */
export async function assignPerfilEmpleado(idEmpleado, idPerfil) {
  const { data } = await api.put(`/empleados/${idEmpleado}/perfil`, {
    id_perfil: Number(idPerfil),
  });
  return data?.data ?? true;
}
export async function assignComponenteEmpleado(idEmpleado, idComponente) {
  const { data } = await api.put(`/empleados/${idEmpleado}/componente`, {
    id_componente: Number(idComponente),
  });
  return data?.data ?? true;
}
