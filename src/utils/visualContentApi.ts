const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BUCKET = "contenido-visual";

export type VisualAssetType = "SLIDE" | "PROMOCION_SEMANA";
export interface VisualAsset {
  id_contenido: number;
  tipo: VisualAssetType;
  titulo: string;
  imagen_path: string;
  orden: number;
  activo: boolean;
  imageUrl: string;
}

export async function fetchVisualAssets(tipo: VisualAssetType): Promise<VisualAsset[]> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("La conexión con las imágenes no está configurada.");
  }

  const url = new URL(SUPABASE_URL + "/rest/v1/contenido_visual");
  url.search = new URLSearchParams({
    select: "id_contenido,tipo,titulo,imagen_path,orden,activo",
    tipo: "eq." + tipo,
    activo: "eq.true",
    order: "orden.asc,created_at.desc",
  }).toString();

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!response.ok) {
    throw new Error("La consulta de imágenes respondió con el estado " + response.status + ".");
  }

  const assets = await response.json() as Omit<VisualAsset, "imageUrl">[];
  return assets.map((asset) => ({
    ...asset,
    imageUrl: SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/" +
      asset.imagen_path.split("/").map(encodeURIComponent).join("/"),
  }));
}