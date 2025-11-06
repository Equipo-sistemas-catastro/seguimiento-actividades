// src/features/ver-informes/service.js
import api from "@/lib/api";

// Buscar empleados activos por nombre (máx 20)
export async function buscarEmpleados(search = "") {
  const { data } = await api.get("/ver-informes/catalogos/empleados", { params: { search } });
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getAniosEmpleado(id_empleado) {
  if (!id_empleado) return [];
  const { data } = await api.get(`/ver-informes/catalogos/anios/${id_empleado}`);
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getMesesEmpleado(id_empleado, anio) {
  if (!id_empleado || !anio) return [];
  const { data } = await api.get(`/ver-informes/catalogos/meses/${id_empleado}/${anio}`);
  return Array.isArray(data?.items) ? data.items : [];
}

export async function generarInformeEmpleado(id_empleado, anio, mes) {
  const { data } = await api.get("/ver-informes/generar", { params: { id_empleado, anio, mes } });
  return Array.isArray(data?.items) ? data.items : [];
}

// PDF usando axios instance (auth/cabeceras ya integradas), y blob
export async function exportarPdfEmpleado(payload) {
  const { data } = await api.post("/ver-informes/pdf", payload, { responseType: "blob" });
  return data; // Blob
}
