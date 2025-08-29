// src/features/obligaciones/service.js
import api from "@/lib/api";

/** Normaliza filas de obligaciones a { id, obligacion } */
function normalize(row = {}) {
  return {
    id: row.id_obligacion ?? row.id ?? null,
    obligacion:
      row.obligacion ??
      row.obligacion_contractual ??
      row.descripcion ??
      "",
  };
}

/** Listado de obligaciones */
export async function fetchObligaciones({ q = "", page = 1, pageSize = 200 } = {}) {
  const { data } = await api.get("/obligaciones", { params: { q, page, pageSize } });
  if (Array.isArray(data?.items)) return data.items.map(normalize);
  if (Array.isArray(data)) return data.map(normalize);
  if (Array.isArray(data?.rows)) return data.rows.map(normalize);
  return [];
}
