const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface Promotion {
  id: string;
  orden: number;
  day_name: string;
  short_day: string;
  title: string;
  description: string;
  badge: string;
  highlights: string[];
}

export async function fetchPromotions(): Promise<Promotion[]> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("La conexión con las promociones no está configurada.");
  }

  const url = new URL(SUPABASE_URL + "/rest/v1/promociones_diarias");
  url.search = new URLSearchParams({
    select: "id,orden,day_name,short_day,title,description,badge,highlights",
    order: "orden.asc",
  }).toString();

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!response.ok) {
    throw new Error("La consulta de promociones respondió con el estado " + response.status + ".");
  }

  const rows = await response.json() as Promotion[];
  return rows.map((row) => ({
    id: row.id,
    orden: row.orden,
    dayName: row.day_name,
    shortDay: row.short_day,
    title: row.title,
    description: row.description,
    badge: row.badge,
    highlights: row.highlights,
  }));
}