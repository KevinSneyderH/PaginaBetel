/**
 * Cliente ligero de tiempo real para PaginaBetel
 *
 * Utiliza canales privados de Supabase Realtime bajo el patrón "señal + recarga".
 * La base de datos emite únicamente el nombre de la tabla afectada (sin datos de filas).
 * El cliente recibe la señal y vuelve a consultar la Data API REST con RLS.
 */

import { useEffect, useRef } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

type ListenerCambio = (tabla: string) => void;

class RealtimeHubPublico {
  private client: SupabaseClient | null = null;
  private canal: RealtimeChannel | null = null;
  private oyentes = new Set<ListenerCambio>();
  private refCount = 0;
  private temporizadorInactividad: number | null = null;
  private desconectadoPorInactividad = false;

  private async obtenerCliente(): Promise<SupabaseClient | null> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    if (!this.client) {
      const { createClient } = await import("@supabase/supabase-js");
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.client;
  }

  async conectar() {
    this.refCount += 1;
    if (this.canal) return;

    const cliente = await this.obtenerCliente();
    if (!cliente) return;

    // Se suscribe al canal privado de cambios públicos
    this.canal = cliente.channel("publico:cambios", {
      config: { private: true },
    });

    this.canal.on("broadcast", { event: "cambio" }, (payload) => {
      const datos = (payload.payload ?? {}) as { tabla?: string };
      const tablaAfectada = datos.tabla;
      if (typeof tablaAfectada === "string") {
        this.notificar(tablaAfectada);
      }
    });

    this.canal.subscribe((status) => {
      if (status === "SUBSCRIBED" && this.desconectadoPorInactividad) {
        this.desconectadoPorInactividad = false;
        // Al reconectar tras inactividad, resincroniza todo por si hubo cambios mientras estuvo dormida
        this.notificar("*");
      }
    });

    this.iniciarDetectorVisibilidad();
  }

  desconectar() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0 && this.canal) {
      void this.canal.unsubscribe();
      this.canal = null;
      this.limpiarTemporizadorInactividad();
    }
  }

  suscribir(oyente: ListenerCambio): () => void {
    this.oyentes.add(oyente);
    void this.conectar();

    return () => {
      this.oyentes.delete(oyente);
      this.desconectar();
    };
  }

  private notificar(tabla: string) {
    for (const oyente of this.oyentes) {
      try {
        oyente(tabla);
      } catch (error) {
        console.error("Error en listener de tiempo real:", error);
      }
    }
  }

  private iniciarDetectorVisibilidad() {
    if (typeof document === "undefined") return;

    const handleVisibility = () => {
      if (document.hidden) {
        // En plan Free (límite 200 conexiones): desconectar si la pestaña pasa más de 60s oculta
        this.temporizadorInactividad = window.setTimeout(() => {
          if (document.hidden && this.canal) {
            this.desconectadoPorInactividad = true;
            void this.canal.unsubscribe();
            this.canal = null;
          }
        }, 60_000);
      } else {
        this.limpiarTemporizadorInactividad();
        if (this.desconectadoPorInactividad || (!this.canal && this.refCount > 0)) {
          void this.conectar();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
  }

  private limpiarTemporizadorInactividad() {
    if (this.temporizadorInactividad !== null) {
      window.clearTimeout(this.temporizadorInactividad);
      this.temporizadorInactividad = null;
    }
  }
}

const hubPublico = new RealtimeHubPublico();

/**
 * Hook para recargar datos automáticamente cuando Supabase emita una señal de cambio en las tablas indicadas.
 * Incluye debounce (400ms) y jitter aleatorio (0 a 1500ms) para evitar picos de peticiones concurrentes a la base de datos.
 */
export function useCambiosEnVivo(tablas: string[], recargar: () => void | Promise<void>) {
  const recargarRef = useRef(recargar);
  const tablasRef = useRef(tablas);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    recargarRef.current = recargar;
    tablasRef.current = tablas;
  });

  useEffect(() => {
    const oyente: ListenerCambio = (tablaAfectada) => {
      const tablasInteres = tablasRef.current;
      const coincide = tablaAfectada === "*" || tablasInteres.includes(tablaAfectada);
      if (!coincide) return;

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // 400ms debounce base + jitter aleatorio de 0 a 1500ms
      const retraso = 400 + Math.floor(Math.random() * 1500);
      debounceTimerRef.current = window.setTimeout(() => {
        void recargarRef.current();
      }, retraso);
    };

    const desuscribir = hubPublico.suscribir(oyente);

    return () => {
      desuscribir();
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
}
