// src/features/informe-actividades/service.js
import api from "@/lib/api";

// Años disponibles para el informe (del empleado logueado)
export async function getAniosInforme() {
  const { data } = await api.get("/informe-actividades/catalogos/anios");
  // backend responde { ok: true, items: [...] }
  return Array.isArray(data?.items) ? data.items : [];
}

// Meses disponibles para un año dado (formato 'MM' desde el backend)
export async function getMesesInforme(anio) {
  if (!anio) return [];
  const { data } = await api.get(`/informe-actividades/catalogos/meses/${anio}`);
  return Array.isArray(data?.items) ? data.items : [];
}

// Generar informe (tabla de obligaciones + actividades + url evidencia + encabezado)
export async function generarInformeActividades(anio, mes) {
  const { data } = await api.get("/informe-actividades/generar", {
    params: { anio, mes },
  });
  return Array.isArray(data?.items) ? data.items : [];
}
