// src/features/perfil-obligaciones/service.js
import api from "@/lib/api";

/**
 * Devuelve nombres de perfiles relacionados a una obligación.
 * Intentamos varias rutas para adaptarnos al backend actual sin romper.
 * Retorna: string[] (puede ser [])
 */
export async function getPerfilesByObligacion(idObligacion) {
  // Opción 1: endpoint explícito
  try {
    const r = await api.get(`/perfil-obligaciones/by-obligacion/${idObligacion}`);
    const list = Array.isArray(r?.data?.data)
      ? r.data.data
      : Array.isArray(r?.data)
      ? r.data
      : [];
    return list
      .map((x) => x?.perfil || x?.nombre_perfil || x?.perfil_nombre || x?.nombre)
      .filter(Boolean)
      .map(String);
  } catch (_) {}

  // Opción 2: query general
  try {
    const r = await api.get(`/perfil-obligaciones`, {
      params: { id_obligacion: idObligacion },
    });
    const list = Array.isArray(r?.data?.data)
      ? r.data.data
      : Array.isArray(r?.data)
      ? r.data
      : [];
    return list
      .map((x) => x?.perfil || x?.nombre_perfil || x?.perfil_nombre || x?.nombre)
      .filter(Boolean)
      .map(String);
  } catch (_) {}

  // Opción 3: relaciones colgando de obligaciones
  try {
    const r = await api.get(`/obligaciones/${idObligacion}/relations`);
    const direct =
      r?.data?.perfil ||
      r?.data?.perfil_nombre ||
      r?.data?.nombre_perfil ||
      r?.data?.nombre;
    if (direct) return [String(direct)];

    const arr = r?.data?.perfiles || r?.data?.profiles || [];
    if (Array.isArray(arr) && arr.length) {
      return arr
        .map((x) => x?.perfil || x?.nombre)
        .filter(Boolean)
        .map(String);
    }
  } catch (_) {}

  return [];
}

/**
 * Elimina TODAS las relaciones perfil–obligación de una obligación.
 * Intentamos variantes de endpoint; si la primera falla, probamos otra.
 */
export async function deleteRelacionesByObligacion(idObligacion) {
  // Opción 1: DELETE directo
  try {
    const r = await api.delete(
      `/perfil-obligaciones/by-obligacion/${idObligacion}`
    );
    return r.data;
  } catch (_) {}

  // Opción 2: DELETE con query/body
  try {
    const r = await api.delete(`/perfil-obligaciones`, {
      data: { id_obligacion: idObligacion },
    });
    return r.data;
  } catch (_) {}

  // Opción 3: POST/PUT a una ruta utilitaria
  try {
    const r = await api.post(`/perfil-obligaciones/remove-by-obligacion`, {
      id_obligacion: idObligacion,
    });
    return r.data;
  } catch (e) {
    // Si nada aplica, dejamos que el backend haga cumplir integridad
    throw e;
  }
}
