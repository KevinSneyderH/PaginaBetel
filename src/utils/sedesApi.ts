import { useCallback, useEffect, useState } from "react";
import { assetPath } from "./assetPath";
import { SEDES_DATA, type Sede } from "../data/sedesData";
import { useCambiosEnVivo } from "./realtime";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BUCKET = "contenido-visual";

export interface SedeRow {
  id_sede: number;
  slug: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  horario: string;
  servicio_nocturno: string | null;
  tiene_cafeteria: boolean;
  horario_cafeteria: string | null;
  es_24_horas: boolean;
  tiene_ventanilla: boolean;
  imagen_path: string;
  mapa_query: string;
  orden: number;
  activa: boolean;
}

export function resolverImagenSede(imagenPath: string): string {
  if (!imagenPath) return assetPath("/images/banner-nosotros.jpg");
  if (imagenPath.startsWith("http://") || imagenPath.startsWith("https://")) return imagenPath;
  if (imagenPath.startsWith("/")) return assetPath(imagenPath);
  if (!SUPABASE_URL) return imagenPath;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${imagenPath.split("/").map(encodeURIComponent).join("/")}`;
}

export function mapearFilaASede(row: SedeRow): Sede {
  return {
    id: row.slug || String(row.id_sede),
    name: row.nombre,
    city: row.ciudad,
    address: row.direccion,
    phone: row.telefono,
    hours: row.horario,
    nightService: row.servicio_nocturno || undefined,
    hasCafeteria: row.tiene_cafeteria,
    cafeteriaHours: row.horario_cafeteria || undefined,
    is24Hours: row.es_24_horas,
    hasVentanilla: row.tiene_ventanilla,
    image: resolverImagenSede(row.imagen_path),
    mapQuery: row.mapa_query || `Supermercado Betel ${row.nombre} ${row.ciudad}`,
  };
}

export async function fetchSedes(signal?: AbortSignal): Promise<Sede[]> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return SEDES_DATA;
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/sedes`);
  url.search = new URLSearchParams({
    select: "*",
    activa: "eq.true",
    order: "orden.asc,id_sede.asc",
  }).toString();

  const response = await fetch(url, {
    cache: "no-store",
    signal,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar sedes.`);
  }

  const rows = (await response.json()) as SedeRow[];
  if (!rows || rows.length === 0) return SEDES_DATA;
  return rows.map(mapearFilaASede);
}

export function useSedes() {
  const [sedes, setSedes] = useState<Sede[]>(SEDES_DATA);

  const cargar = useCallback(async () => {
    try {
      const data = await fetchSedes();
      if (data && data.length > 0) {
        setSedes(data);
      }
    } catch {
      // Mantiene SEDES_DATA de respaldo
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useCambiosEnVivo(["sedes"], cargar);

  return { sedes, recargar: cargar };
}

