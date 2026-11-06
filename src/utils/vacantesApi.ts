import { useCallback, useEffect, useState } from "react";
import { useCambiosEnVivo } from "./realtime";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface VacancyItem {
  id_vacante: number;
  titulo: string;
  cargo: string;
  area?: string;
  ubicacion?: string;
  tipo_contrato?: string;
}

export async function fetchVacancies(signal?: AbortSignal): Promise<VacancyItem[]> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return [];

  const url = new URL(`${SUPABASE_URL}/rest/v1/vacantes`);
  url.search = new URLSearchParams({
    select: "id_vacante,titulo,cargo,area,ubicacion,tipo_contrato",
    publicada: "eq.true",
    estado: "eq.ABIERTA",
    order: "created_at.desc",
  }).toString();

  const response = await fetch(url, {
    cache: "no-store",
    signal,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) return [];
  return (await response.json()) as VacancyItem[];
}

export function useVacancies() {
  const [vacantes, setVacantes] = useState<VacancyItem[]>([]);

  const cargar = useCallback(async () => {
    try {
      const data = await fetchVacancies();
      setVacantes(data);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useCambiosEnVivo(["vacantes"], cargar);

  return { vacantes, recargar: cargar };
}
