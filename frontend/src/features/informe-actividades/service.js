// src/features/informe-actividades/service.js
import api from "@/lib/api";

// Años disponibles para el informe (del empleado logueado)
export async function getAniosInforme() {
  const { data } = await api.get("/informe-actividades/catalogos/anios");
  return Array.isArray(data?.items) ? data.items : [];
}

// Meses disponibles para un año dado
export async function getMesesInforme(anio) {
  if (!anio) return [];
  const { data } = await api.get(`/informe-actividades/catalogos/meses/${anio}`);
  return Array.isArray(data?.items) ? data.items : [];
}

// Generar informe (datos)
export async function generarInformeActividades(anio, mes) {
  const { data } = await api.get("/informe-actividades/generar", {
    params: { anio, mes },
  });
  return Array.isArray(data?.items) ? data.items : [];
}

// Exportar PDF (arreglo binario correcto)
export async function exportarPdfInforme(payload) {
  const { data } = await api.post("/informe-actividades/pdf", payload, {
    responseType: "arraybuffer", // 👈 obligatorio para recibir binario intacto
  });
  return new Blob([data], { type: "application/pdf" }); // 👈 Blob válido
}

