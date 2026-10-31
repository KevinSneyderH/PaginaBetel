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
  private clientPromise: Promise<SupabaseClient | null> | null = null;
  private canal: RealtimeChannel | null = null;
  private canalPromise: Promise<void> | null = null;
  private oyentes = new Set<ListenerCambio>();
  private refCount = 0;
  private temporizadorInactividad: number | null = null;
  private temporizadorDesconexion: number | null = null;
  private desconectadoPorInactividad = false;

  private obtenerCliente(): Promise<SupabaseClient | null> {
    if (this.client) return Promise.resolve(this.client);
    if (this.clientPromise) return this.clientPromise;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return Promise.resolve(null);

    this.clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          storageKey: "sb-public-betel-realtime",
        },
      });
      return this.client;
    });

    return this.clientPromise;
  }

  async conectar() {
    this.refCount += 1;
    this.limpiarTemporizadorDesconexion();

    if (this.canal) return;
    if (this.canalPromise) {
      await this.canalPromise;
      return;
    }

    this.canalPromise = (async () => {
      const cliente = await this.obtenerCliente();
      if (!cliente) return;
      if (this.canal) return;

      // Se suscribe al canal privado de cambios públicos
      const nuevoCanal = cliente.channel("publico:cambios", {
        config: { private: true },
      });

      nuevoCanal.on("broadcast", { event: "cambio" }, (payload) => {
        const datos = (payload.payload ?? {}) as { tabla?: string };
        const tablaAfectada = datos.tabla;
        if (typeof tablaAfectada === "string") {
          this.notificar(tablaAfectada);
        }
      });

      nuevoCanal.subscribe((status) => {
        if (status === "SUBSCRIBED" && this.desconectadoPorInactividad) {
          this.desconectadoPorInactividad = false;
          // Al reconectar tras inactividad, resincroniza todo por si hubo cambios
          this.notificar("*");
        }
      });

      this.canal = nuevoCanal;
      this.iniciarDetectorVisibilidad();
    })();

    try {
      await this.canalPromise;
    } finally {
      this.canalPromise = null;
    }
  }

  desconectar() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      this.limpiarTemporizadorDesconexion();
      // Periodo de gracia de 1.5s antes de cerrar el WebSocket para evitar desconexiones abruptas
      // durante montajes rápidos de componentes iniciales o re-renders
      this.temporizadorDesconexion = window.setTimeout(() => {
        if (this.refCount === 0 && this.canal) {
          void this.canal.unsubscribe();
          this.canal = null;
          this.limpiarTemporizadorInactividad();
        }
      }, 1500);
    }
  }

  private limpiarTemporizadorDesconexion() {
    if (this.temporizadorDesconexion !== null) {
      window.clearTimeout(this.temporizadorDesconexion);
      this.temporizadorDesconexion = null;
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
