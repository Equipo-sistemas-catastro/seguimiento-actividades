import api from "@/lib/api";

/** ============================
 *  Mis Requerimientos — Service
 *  ============================ */

/** Estados (para construir las 3 columnas del Kanban) */
export async function fetchEstados() {
  const { data } = await api.get("/mis-requerimientos/catalogos/estados");
  // Esperado: array [{ id_estado, estado }]
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/** Listado de MIS requerimientos (solo asignados al usuario) */
export async function fetchMisRequerimientos({
  q = "",
  estado = null,
  page = 1,
  pageSize = 10,
} = {}) {
  const params = { q, page, pageSize };
  if (estado != null && estado !== "") params.estado = estado;

  const { data } = await api.get("/mis-requerimientos", { params });
  // Backend retorna { items, total, page, pageSize }
  const items =
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data) ? data : [];
  return {
    items,
    total: data?.total ?? items.length ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

/** Detalle de un MIS requerimiento (validado que esté asignado al usuario) */
export async function fetchMisRequerimientoById(id_req) {
  if (!id_req) throw new Error("id_req requerido");
  const { data } = await api.get(`/mis-requerimientos/${id_req}`);
  // Esperado: objeto con campos del requerimiento + empleados[]
  return data || null;
}

/** Catálogo: obligaciones del perfil ACTIVO del empleado logueado */
export async function fetchMisObligaciones() {
  const { data } = await api.get("/actividades/catalogos/mis-obligaciones");
  // Esperado: array [{ id_obligacion, obligacion_contractual }]
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/** Crear actividad para un requerimiento asignado */
export async function createActividad({
  id_req,
  actividad,
  fecha_inicio_actividad,
  fecha_fin_programada,
  id_estado = 1, // POR HACER por defecto
  obligaciones = [],
}) {
  if (!id_req) throw new Error("id_req es obligatorio");
  if (!actividad || !actividad.trim()) throw new Error("La descripción de la actividad es obligatoria");
  if (!fecha_inicio_actividad || !fecha_fin_programada) throw new Error("Las fechas son obligatorias");
  if (!Array.isArray(obligaciones) || obligaciones.length === 0) throw new Error("Debe seleccionar al menos una obligación");

  const payload = {
    id_req,
    actividad: actividad.trim(),
    fecha_inicio_actividad, // 'YYYY-MM-DD'
    fecha_fin_programada,   // 'YYYY-MM-DD'
    id_estado,
    obligaciones,
  };

  const { data } = await api.post("/actividades", payload);
  // Esperado: { ok: true, id_actividad }
  return data;
}
