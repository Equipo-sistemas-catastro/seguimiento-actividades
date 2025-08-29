// src/features/empleados/service.js
import api from "@/lib/api";

/** Normaliza una fila proveniente del backend a la UI */
function normalize(row = {}) {
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
    // clave primaria normalizada
    id: row.id_empleado != null ? String(row.id_empleado) : row.id != null ? String(row.id) : null,

    // campos visibles
    cedula: row.cedula_empleado ?? row.cedula ?? "",
    nombre,
    email: row.email_empleado ?? row.email ?? "",
    movil: row.movil_empleado ?? row.movil ?? "",
    estado: (row.estado ?? "").toString().toLowerCase() === "inactivo" ? "inactivo" : "activo",

    // para formulario
    primer_nombre_empl: row.primer_nombre_empl ?? "",
    segundo_nombre_empl: row.segundo_nombre_empl ?? "",
    primer_apellido_empl: row.primer_apellido_empl ?? "",
    segundo_apellido_empl: row.segundo_apellido_empl ?? "",
    fecha_nacimiento_empl: row.fecha_nacimiento_empl ?? null,

    // auditoría / raw
    fecha_auditoria: row.fecha_auditoria ?? null,
    _raw: row,
  };
}

/** Lista paginada de empleados */
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

  // Soporta varias envolturas posibles
  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  return {
    items: rows.map(normalize),
    total: data?.total ?? rows.length,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

/** Detalle de empleado: tu endpoint retorna { empleado, perfiles_activos, componentes_activos } */
export async function getEmpleadoDetalle(id) {
  if (!id) return null;
  const { data } = await api.get(`/empleados/${id}`);

  // Puede venir como data.data o directo
  const payload = data?.data ?? data ?? {};
  const empleado = payload?.empleado ?? payload?.Empleado ?? null;

  if (!empleado) return null;

  const norm = normalize(empleado);

  // Si quisieras usar estos IDs en el form más adelante:
  const perfilActivo = Array.isArray(payload?.perfiles_activos) ? payload.perfiles_activos[0] : null;
  const componenteActivo = Array.isArray(payload?.componentes_activos) ? payload.componentes_activos[0] : null;

  return {
    ...norm,
    perfil_id: perfilActivo?.id_perfil ? String(perfilActivo.id_perfil) : undefined,
    componente_id: componenteActivo?.id_componente ? String(componenteActivo.id_componente) : undefined,
  };
}

/** Crear empleado (mapeo form -> backend) */
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
  return normalize(data?.data ?? data ?? {});
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
  return normalize(data?.data ?? data ?? {});
}
