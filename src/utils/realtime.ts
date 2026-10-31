/**
 * Cliente ligero de tiempo real para PaginaBetel
 *
 * Utiliza canales privados de Supabase Realtime bajo el patrón "señal + recarga".
 * La base de datos emite únicamente el nombre de la tabla afectada (sin datos de filas).
 * El cliente recibe la señal y vuelve a consultar la Data API REST con RLS.
 */

import { useEffect, useRef } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

type ListenerCambio = (tabla: string) => void;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cliente singleton para Realtime en la web pública (sin persistencia de auth para evitar conflictos)
let supabaseRealtime: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseRealtime = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "sb-public-betel-realtime",
    },
  });
}

class RealtimeHubPublico {
  private canal: RealtimeChannel | null = null;
  private oyentes = new Set<ListenerCambio>();
  private refCount = 0;
  private temporizadorInactividad: number | null = null;
  private temporizadorDesconexion: number | null = null;
  private desconectadoPorInactividad = false;
  private detectorVisibilidadIniciado = false;
  private estadoSuscripcion: "INICIAL" | "CONECTANDO" | "CONECTADO" | "CERRADO" = "INICIAL";
  private pendienteDesconectar = false;

  conectar() {
    this.refCount += 1;
    this.limpiarTemporizadorDesconexion();
    this.pendienteDesconectar = false;

    if (!supabaseRealtime) return;
    if (this.canal && (this.estadoSuscripcion === "CONECTADO" || this.estadoSuscripcion === "CONECTANDO")) {
      return;
    }

    this.iniciarCanal();
    this.iniciarDetectorVisibilidad();
  }

  private iniciarCanal() {
    if (!supabaseRealtime) return;

    this.estadoSuscripcion = "CONECTANDO";

    // Se suscribe al canal privado de cambios públicos
    const nuevoCanal = supabaseRealtime.channel("publico:cambios", {
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
      if (status === "SUBSCRIBED") {
        this.estadoSuscripcion = "CONECTADO";
        if (this.pendienteDesconectar) {
          this.pendienteDesconectar = false;
          this.ejecutarDesconexion();
          return;
        }
        if (this.desconectadoPorInactividad) {
          this.desconectadoPorInactividad = false;
          // Al reconectar tras inactividad, resincroniza todo por si hubo cambios
          this.notificar("*");
        }
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        this.estadoSuscripcion = "CERRADO";
      }
    });

    this.canal = nuevoCanal;
  }

  private ejecutarDesconexion() {
    if (!this.canal || !supabaseRealtime) return;
    const canalAEliminar = this.canal;
    this.canal = null;
    this.estadoSuscripcion = "CERRADO";
    this.limpiarTemporizadorInactividad();

    // supabase.removeChannel realiza la limpieza completa del canal en Realtime sin dejar sockets colgados
    void supabaseRealtime.removeChannel(canalAEliminar);
  }

  desconectar() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      this.limpiarTemporizadorDesconexion();
      // Periodo de gracia de 5 segundos antes de cerrar el WebSocket para evitar desconexiones abruptas
      // durante montajes rápidos de componentes iniciales o re-renders en React
      this.temporizadorDesconexion = window.setTimeout(() => {
        if (this.refCount === 0) {
          // Si el socket aún está en proceso de handshake (CONECTANDO), no lo cerramos abruptamente
          // para evitar la advertencia de Chromium; marcamos pendiente para cerrar una vez completado.
          if (this.estadoSuscripcion === "CONECTANDO") {
            this.pendienteDesconectar = true;
          } else {
            this.ejecutarDesconexion();
          }
        }
      }, 5000);
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
    this.conectar();

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
    if (this.detectorVisibilidadIniciado || typeof document === "undefined") return;
    this.detectorVisibilidadIniciado = true;

    const handleVisibility = () => {
      if (document.hidden) {
        // En plan Free (límite 200 conexiones): desconectar si la pestaña pasa más de 60s oculta
        this.temporizadorInactividad = window.setTimeout(() => {
          if (document.hidden && this.canal) {
            this.desconectadoPorInactividad = true;
            this.ejecutarDesconexion();
          }
        }, 60_000);
      } else {
        this.limpiarTemporizadorInactividad();
        if (this.desconectadoPorInactividad || (!this.canal && this.refCount > 0)) {
          this.conectar();
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
