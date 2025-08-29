// src/features/perfiles/service.js
import api from "@/lib/api";

/** Normaliza filas desde backend a { id, perfil, descripcion } */
function normalize(row = {}) {
  return {
    id: row.id_perfil ?? row.id ?? null,
    perfil: row.perfil ?? "",
    descripcion: row.descripcion ?? "",
  };
}

/** Lista de perfiles */
export async function fetchPerfiles({ q = "", page = 1, pageSize = 100 } = {}) {
  const { data } = await api.get("/perfiles", { params: { q, page, pageSize } });
  if (Array.isArray(data?.items)) return data.items.map(normalize);
  if (Array.isArray(data)) return data.map(normalize);
  if (Array.isArray(data?.rows)) return data.rows.map(normalize);
  return [];
}

/** Crear perfil → retorna SIEMPRE el id del nuevo perfil (uuid/num) */
export async function createPerfil(body = {}) {
  const payload = { perfil: body.perfil, descripcion: body.descripcion ?? "" };
  const { data } = await api.post("/perfiles", payload);

  const id =
    data?.id_perfil ??
    data?.id ??
    data?.data?.id ??
    data?.data?.id_perfil ??
    data?.newId ??
    data?.insertId ??
    (typeof data === "string" || typeof data === "number" ? data : null);

  if (!id) {
    const err = new Error("createPerfil no devolvió id");
    err.response = { data };
    throw err;
  }
  return id;
}

/** Actualizar perfil */
export async function updatePerfil(id, body = {}) {
  const payload = { perfil: body.perfil, descripcion: body.descripcion ?? "" };
  await api.put(`/perfiles/${id}`, payload);
  return true;
}

/** Obtener un perfil por id, incluyendo relaciones (obligaciones, usuarios, etc.) */
export async function fetchPerfilById(id) {
  const { data } = await api.get(`/perfiles/${id}`);
  // Esperado: { id_perfil, perfil, descripcion, obligaciones: [{id_obligacion, obligacion_contractual}] ... }
  return data || null;
}

/** Guardar asignaciones de obligaciones (y opcional usuarios) del perfil */
export async function setAsignacionesPerfil(
  idPerfil,
  { obligacionesIds = [], usuariosIds = [] } = {}
) {
  await api.put(`/perfiles/${idPerfil}/asignaciones`, { obligacionesIds, usuariosIds });
  return true;
}
