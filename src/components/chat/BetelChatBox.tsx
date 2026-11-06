import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUp,
  Briefcase,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { assetPath } from "../../utils/assetPath";
import { useSedes } from "../../utils/sedesApi";
import { usePromotions } from "../../utils/promotionsApi";
import { useVacancies } from "../../utils/vacantesApi";

/**
 * PISTA DE ACTIVACIÓN PQRS:
 * Cuando el usuario indique "activa el pqrs ya dieron el visto bueno",
 * cambiar ENABLE_PQRS_FLOW a true para habilitar la radicación y consulta
 * de estado de PQRS paso a paso dentro del chatbot.
 */
export const ENABLE_PQRS_FLOW = false;

const ATENCION_GENERAL_PHONE = "3176797058";
const ATENCION_GENERAL_DISPLAY = "317 679 7058";
const RRHH_WHATSAPP = "3175177648";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface ChatStoreAction {
  nombre: string;
  ciudad?: string;
  direccion: string;
  telefono: string;
  horario?: string;
  servicio_nocturno?: string | null;
  tiene_cafeteria?: boolean;
  horario_cafeteria?: string | null;
  es_24_horas?: boolean;
  tiene_ventanilla?: boolean;
  mapa_query?: string | null;
}

export type ChatIntent =
  | "select_order_store"
  | "order_store"
  | "store_info"
  | "stores_list"
  | "promociones"
  | "promocion_dia"
  | "pqrs_general"
  | "vacantes"
  | "general";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
  isRadicado?: boolean;
  radicadoCodigo?: string;
  intent?: ChatIntent;
  stores?: ChatStoreAction[];
  generalPhone?: string;
  resumenPqrs?: {
    tipo: string;
    nombre: string;
    telefono: string;
    correo?: string;
    tienda?: string;
    descripcion: string;
  };
};

export type TipoCaso = "PETICION" | "QUEJA" | "RECLAMO" | "SUGERENCIA" | "ASESOR";
export type CaseStep =
  | "initial-consent"
  | "type"
  | "name"
  | "phone"
  | "email"
  | "store"
  | "description"
  | "consent"
  | "status-code";

export type CaseData = {
  nombre: string;
  telefono: string;
  correo: string;
  tienda: string;
  descripcion: string;
};

const STEP_LABELS: Record<CaseStep, { paso: number; total: number; label: string }> = {
  "initial-consent": { paso: 1, total: 7, label: "Autorización de datos" },
  type: { paso: 2, total: 7, label: "Tipo de solicitud" },
  name: { paso: 3, total: 7, label: "Nombre completo" },
  phone: { paso: 4, total: 7, label: "Teléfono de contacto" },
  email: { paso: 5, total: 7, label: "Correo electrónico" },
  store: { paso: 6, total: 7, label: "Sede relacionada" },
  description: { paso: 7, total: 7, label: "Detalle de los hechos" },
  consent: { paso: 7, total: 7, label: "Resumen y confirmación" },
  "status-code": { paso: 1, total: 1, label: "Consultar radicado" },
};

function createUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function callPqrsChat(body: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("El servicio de atención no está configurado.");
  }
  const response = await fetch(`${SUPABASE_URL}/functions/v1/pqrs-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Error ${response.status}`);
  }
  return response.json();
}

const newMessage = (
  role: ChatMessage["role"],
  text: string,
  extra?: Partial<Omit<ChatMessage, "id" | "role" | "text" | "time">>,
): ChatMessage => ({
  id: createUuid(),
  role,
  text,
  time: new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(new Date()),
  ...extra,
});

function isStatusLookupRequest(message: string) {
  const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const mentionsRequest = /\b(mi|mis|una|la|el|sobre|de|por)?\s*(solicitud|caso|pqrs|reclamo|radicado)\b/.test(
    normalized,
  );
  const asksForProgress =
    /\b(consultar|consulta|preguntar|saber|ver|revisar|seguimiento|estado|avance|va|sigue|proceso|respuesta)\b/.test(
      normalized,
    );
  return mentionsRequest && asksForProgress;
}

function buildGoogleMapsUrl(store: ChatStoreAction): string {
  const query =
    store.mapa_query?.trim() ||
    `Supermercado Betel ${store.nombre}, ${store.direccion}, ${store.ciudad || "Cúcuta"}, Norte de Santander`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildWhatsAppOrderUrl(phone: string, storeName?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
  const greeting = storeName
    ? `Hola Supermercados Betel (${storeName}), quiero hacer un pedido a domicilio`
    : "Hola Supermercados Betel, quiero hacer un pedido a domicilio";
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(greeting)}`;
}

function buildWhatsAppGeneralUrl(phone = ATENCION_GENERAL_PHONE): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
  const text = "Hola Atención General Betel, necesito información / presentar una solicitud o PQRS";
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

function renderFormattedText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

interface BetelChatBoxProps {
  isWidget?: boolean;
  isExpanded?: boolean;
  onClose?: () => void;
  onToggleExpand?: () => void;
  onOpenWhatsApp?: () => void;
}

const CHAT_STORAGE_KEY = "betel_chat_session_messages";
const CHAT_SESSION_KEY = "betel_chat_session_id";

function normalizeUserText(input: string): string {
  const sinTildes = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return sinTildes
    .replace(/\bpromosion(es)?\b/g, (_, p1) => (p1 ? "promociones" : "promocion"))
    .replace(/\bbacante(s)?\b/g, (_, p1) => (p1 ? "vacantes" : "vacante"))
    .replace(/\btravaj(o|ar|ador|adores)?\b/g, (_, p1) => `trabaj${p1 || "o"}`)
    .replace(/\bdomisili(o|os)?\b/g, (_, p1) => (p1 === "os" ? "domicilios" : "domicilio"))
    .replace(/\borari(o|os)?\b/g, (_, p1) => (p1 === "os" ? "horarios" : "horario"))
    .replace(/\bdireci(on|ones)?\b/g, (_, p1) => (p1 === "ones" ? "direcciones" : "direccion"))
    .replace(/\bubipasi(on|ones)?\b/g, (_, p1) => (p1 === "ones" ? "ubicaciones" : "ubicacion"))
    .replace(/\b(wasap|guasap|watsap|wpp|whastapp)\b/g, "whatsapp")
    .replace(/\b(miercole|miercol|mercoles)\b/g, "miercoles")
    .replace(/\bjueve\b/g, "jueves")
    .replace(/\bvierne\b/g, "viernes")
    .replace(/\blune\b/g, "lunes")
    .replace(/\bmarte\b/g, "martes")
    .replace(/\bseiba\b/g, "ceiba")
    .replace(/\bchinakota\b/g, "chinacota")
    .replace(/\b(villamal|villamall)\b/g, "villa mall")
    .replace(/\b(villadelrosario|villarosario)\b/g, "villa del rosario")
    .replace(/\bsanjosedecucuta\b/g, "san jose de cucuta")
    .replace(/\belzulia\b/g, "el zulia")
    .replace(/\bsancayetano\b/g, "san cayetano")
    .replace(/\blafloresta\b/g, "la floresta")
    .replace(/\blagarita\b/g, "la garita")
    .replace(/\belcontento\b/g, "el contento")
    .replace(/\bsanrafael\b/g, "san rafael")
    .replace(/\blospatios\b/g, "los patios")
    .replace(/\bpradosdeleste\b/g, "prados del este")
    .replace(/\b(cafetria|cafetaria)\b/g, "cafeteria");
}

export interface MunicipioInfo {
  key: string;
  nombre: string;
  regex: RegExp;
}

export const MUNICIPIOS_BETEL: MunicipioInfo[] = [
  {
    key: "cucuta",
    nombre: "Cúcuta",
    regex: /\b(cucuta|san jose de cucuta)\b/,
  },
  {
    key: "los patios",
    nombre: "Los Patios",
    regex: /\b(los patios|lospatios|patios)\b/,
  },
  {
    key: "villa del rosario",
    nombre: "Villa del Rosario",
    regex: /\b(villa del rosario|villadelrosario|villa rosario|villarosario|la villa)\b/,
  },
  {
    key: "chinacota",
    nombre: "Chinácota",
    regex: /\b(chinacota|chinakota)\b/,
  },
];

export const MUNICIPIOS_NO_DISPONIBLES: { nombre: string; regex: RegExp }[] = [
  { nombre: "El Zulia", regex: /\b(el zulia|zulia)\b/ },
  { nombre: "San Cayetano", regex: /\b(san cayetano|sancayetano)\b/ },
  { nombre: "Pamplona", regex: /\b(pamplona)\b/ },
  { nombre: "Ocaña", regex: /\b(ocana|ocaña)\b/ },
  { nombre: "Tibú", regex: /\b(tibu|tibu)\b/ },
  { nombre: "Bucaramanga", regex: /\b(bucaramanga|floridablanca|giron|giron|piedecuesta)\b/ },
  { nombre: "Bogotá", regex: /\b(bogota|bogota)\b/ },
  { nombre: "Medellín", regex: /\b(medellin|medellin)\b/ },
];

export function getStoresByMunicipio(municipioKey: string, stores: ChatStoreAction[]): ChatStoreAction[] {
  return stores.filter((s) => {
    const sCity = normalizeUserText(s.ciudad || "");
    const sName = normalizeUserText(s.nombre || "");
    if (municipioKey === "cucuta") {
      return (
        sCity.includes("cucuta") ||
        (!sCity && !sName.includes("patios") && !sName.includes("chinacota") && !sName.includes("villa"))
      );
    }
    if (municipioKey === "los patios") {
      return sCity.includes("patios") || sName.includes("patios");
    }
    if (municipioKey === "villa del rosario") {
      return sCity.includes("villa") || sName.includes("villa mall");
    }
    if (municipioKey === "chinacota") {
      return sCity.includes("chinacota") || sName.includes("chinacota");
    }
    return sCity.includes(municipioKey);
  });
}

function getInitialMessages(): ChatMessage[] {
  try {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(CHAT_STORAGE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [
    newMessage(
      "assistant",
      "¡Hola! Soy el asistente virtual de **Supermercados Betel** 🛒.\n\nPuedo ayudarte a:\n• 🚚 **Pedir un domicilio** eligiendo tu sede para ir a WhatsApp\n• 📍 **Ver direcciones** y abrir nuestras sedes en **Google Maps**\n• 💼 **Consultar vacantes de empleo**, promociones y cafeterías\n• 📞 Comunicarte con **Atención General Betel y PQRS (317 679 7058)**\n\n¿En qué te puedo colaborar hoy?",
    ),
  ];
}

function getInitialSession(): string {
  try {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(CHAT_SESSION_KEY) : null;
    if (saved) return saved;
    const newId = createUuid();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CHAT_SESSION_KEY, newId);
    }
    return newId;
  } catch {
    return createUuid();
  }
}

export default function BetelChatBox({
  isWidget = false,
  isExpanded = false,
  onClose,
  onToggleExpand,
}: BetelChatBoxProps) {
  const { sedes } = useSedes();
  const { promos } = usePromotions();
  const { vacantes } = useVacancies();

  // Convertir las sedes del hook al formato de acción del chat
  const sedesActions: ChatStoreAction[] = sedes.map((s) => ({
    nombre: s.name,
    ciudad: s.city,
    direccion: s.address,
    telefono: s.phone,
    horario: s.hours,
    servicio_nocturno: s.nightService,
    tiene_cafeteria: s.hasCafeteria,
    horario_cafeteria: s.cafeteriaHours,
    es_24_horas: s.is24Hours || /24\s*horas/i.test(s.hours || ""),
    tiene_ventanilla: s.hasVentanilla || Boolean(s.nightService),
    mapa_query: s.mapQuery,
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [input, setInput] = useState("");
  const [session] = useState<string>(getInitialSession);
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectingOrderStore, setSelectingOrderStore] = useState(false);

  // Guardar mensajes en sessionStorage cada vez que cambien para mantener la conversación activa
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // noop
    }
  }, [messages]);

  // Flujo PQRS guiado (activo cuando ENABLE_PQRS_FLOW === true)
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [caseType, setCaseType] = useState<TipoCaso>("PETICION");
  const [caseStep, setCaseStep] = useState<CaseStep | null>(null);
  const [caseData, setCaseData] = useState<CaseData>({
    nombre: "",
    telefono: "",
    correo: "",
    tienda: "",
    descripcion: "",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const dismissKeyboard = () => {
    inputRef.current?.blur();
    setIsInputFocused(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, showCaseForm, selectingOrderStore]);

  // Asegura que en móvil al abrir el teclado el scroll se mantenga en el último mensaje
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const onViewportResize = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    window.visualViewport.addEventListener("resize", onViewportResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // noop
    }
  };

  const resetChat = () => {
    setShowCaseForm(false);
    setCaseStep(null);
    setSelectingOrderStore(false);
    setCaseData({ nombre: "", telefono: "", correo: "", tienda: "", descripcion: "" });
    const freshMessages = [
      newMessage(
        "assistant",
        "Conversación reiniciada. ¿En qué más puedo orientarte hoy? Puedes pedir un domicilio por sede, abrir direcciones en Google Maps o consultar sobre Supermercados Betel.",
      ),
    ];
    setMessages(freshMessages);
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(freshMessages));
      const freshId = createUuid();
      sessionStorage.setItem(CHAT_SESSION_KEY, freshId);
    } catch {
      // noop
    }
  };

  // Inicia el flujo interactivo "¿De qué sede quieres pedir tu domicilio?"
  const startOrderFlow = () => {
    setShowCaseForm(false);
    setCaseStep(null);
    setSelectingOrderStore(true);
    setMessages((current) => [
      ...current,
      newMessage("user", "Quiero pedir un domicilio"),
      newMessage(
        "assistant",
        "¡Con mucho gusto! 🚚 **¿De qué sede quieres pedir tu domicilio?**\n\nSelecciona tu sede a continuación para mostrarte su número directo y abrirlo en WhatsApp:",
        {
          intent: "select_order_store",
          stores: sedesActions,
          generalPhone: ATENCION_GENERAL_PHONE,
        },
      ),
    ]);
  };

  // Cuando el usuario elige una sede para su domicilio
  const handleSelectOrderStore = (store: ChatStoreAction) => {
    setSelectingOrderStore(false);
    setMessages((current) => [
      ...current,
      newMessage("user", `Sede ${store.nombre}`),
      newMessage(
        "assistant",
        `¡Perfecto! 🚚 Para realizar tu pedido a domicilio en **Betel ${store.nombre}**, comunícate al número **${store.telefono}**.\n\n📍 **Dirección:** ${store.direccion}\n🕒 **Horario:** ${store.horario || "Habitual"}${store.servicio_nocturno ? `\n🌙 **${store.servicio_nocturno}**` : ""}\n\nToca el botón de abajo para abrir WhatsApp y hacer tu pedido:`,
        {
          intent: "order_store",
          stores: [store],
        },
      ),
    ]);
  };

  // Muestra directamente la tarjeta de Atención General Betel (317 679 7058) para PQRS
  const showAtencionGeneralPqrs = () => {
    setSelectingOrderStore(false);
    setMessages((current) => [
      ...current,
      newMessage("user", "Atención al cliente / PQRS"),
      newMessage(
        "assistant",
        `Para atender tus **Peticiones, Quejas, Reclamos, Sugerencias (PQRS)** o comunicarte con un asesor de servicio al cliente, escríbenos o llámanos a nuestra línea oficial:\n\n📞 **Atención General Betel**\n**Tel: ${ATENCION_GENERAL_DISPLAY}**\n\nToca cualquiera de los botones a continuación para abrirlo directamente:`,
        {
          intent: "pqrs_general",
          generalPhone: ATENCION_GENERAL_PHONE,
        },
      ),
    ]);
  };

  const sendMessage = async (event?: FormEvent<HTMLFormElement>, textOverride?: string) => {
    if (event) event.preventDefault();
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setInput("");

    const norm = normalizeUserText(text);

    // Helper para buscar sede activa de forma flexible por nombre o alias común
    const findActiveStore = (q: string): ChatStoreAction | undefined => {
      const qNorm = normalizeUserText(q);
      return sedesActions.find((s) => {
        const sNorm = normalizeUserText(s.nombre);
        if (qNorm.includes(sNorm)) return true;
        if (sNorm === "la garita" && /\b(garita|lagarita)\b/.test(qNorm)) return true;
        if (sNorm === "ceiba 2" && /\b(ceiba|seiba)\b/.test(qNorm)) return true;
        if (sNorm === "la floresta" && /\b(floresta|lafloresta)\b/.test(qNorm)) return true;
        if (sNorm === "prados del este" && /\b(prados|prado)\b/.test(qNorm)) return true;
        if (sNorm === "villa mall" && /\b(villamall|villa mall|villamal|villa mal|villa del rosario|villadelrosario|villa rosario|villarosario)\b/.test(qNorm)) return true;
        if (sNorm === "el contento" && /\b(contento|elcontento)\b/.test(qNorm)) return true;
        if (sNorm === "los patios" && /\b(patios|patio|lospatios)\b/.test(qNorm)) return true;
        if (sNorm === "chinacota" && /\b(chinacota|chinakota)\b/.test(qNorm)) return true;
        if (sNorm === "san rafael" && /\b(san rafael|sanrafael|rafael)\b/.test(qNorm)) return true;
        if (sNorm === "bocono" && /\b(bocono|vicono)\b/.test(qNorm)) return true;
        if (sNorm === "chapinero" && /\b(chapinero|chapi)\b/.test(qNorm)) return true;
        return false;
      });
    };

    // Helper para detectar municipio o ciudad consultada
    const matchedCity = MUNICIPIOS_BETEL.find((m) => m.regex.test(norm));
    const matchedUnsupportedCity = MUNICIPIOS_NO_DISPONIBLES.find((m) => m.regex.test(norm));

    // Si estaba seleccionando sede de domicilio y escribe el nombre de una sede o municipio
    if (selectingOrderStore) {
      const matched = findActiveStore(norm);
      if (matched) {
        handleSelectOrderStore(matched);
        return;
      }
      if (matchedCity) {
        const cityStores = getStoresByMunicipio(matchedCity.key, sedesActions);
        if (cityStores.length === 1) {
          handleSelectOrderStore(cityStores[0]);
          return;
        }
      }
      setSelectingOrderStore(false);
    }

    setMessages((current) => [...current, newMessage("user", text)]);

    // 1. INTENT: Trabajo / Empleo / Vacantes / Ofertas de trabajo (NUNCA confundir con ofertas de supermercado)
    const isJobInquiry =
      /\b(trabajo|trabajos|trabajar|empleo|empleos|vacante|vacantes|bacante|bacantes|laboral|laborales|hoja de vida|curriculum|curriculo|cv|hv|postular|postularme|postulacion|postulaciones|contratacion|seleccion|recursos humanos|rrhh|talento humano|pasar papeles|enviar papeles|meter papeles|busco trabajo|busco empleo|ay vacante|hay vacante|ay vacantes|hay vacantes|ay bacante|hay bacante|ay bacantes|hay bacantes)\b/.test(
        norm,
      ) ||
      (/\b(oferta|ofertas)\b/.test(norm) && /\b(trabajo|laboral|laborales|empleo)\b/.test(norm)) ||
      (/\b(trabajo|laboral|laborales|empleo)\b/.test(norm) && /\b(oferta|ofertas)\b/.test(norm));

    if (isJobInquiry) {
      const hayVacantes = vacantes.length > 0;
      const listadoVacantes = hayVacantes
        ? `\n\n📌 **Convocatorias abiertas actualmente (${vacantes.length}):**\n` +
          vacantes
            .slice(0, 6)
            .map((v) => `• **${v.titulo || v.cargo}** — ${v.ubicacion || "Norte de Santander"}${v.area ? ` (${v.area})` : ""}`)
            .join("\n")
        : "\n\nEn este momento puedes enviar tu hoja de vida para futuras convocatorias.";

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `💼 **Convocatorias y Oportunidades Laborales en Supermercados Betel**\n\n¡Qué alegría tu interés en ser parte de la familia Betel! 🛒✨ En Betel buscamos personas comprometidas, con vocación de servicio y ganas de crecer profesionalmente.${listadoVacantes}\n\n📌 **¿Cómo postularte?**\n• Puedes ver todas nuestras **vacantes abiertas**, requisitos y afiches en la sección de [Empleo de nuestra web](#empleo).\n• Envía tu hoja de vida en PDF al correo oficial: **seleccionrh.betel@gmail.com**\n• También puedes escribir directamente al equipo de Selección en WhatsApp: **317 517 7648**.\n\nToca cualquiera de los botones de abajo para ir directamente:`,
          {
            intent: "vacantes",
          },
        ),
      ]);
      return;
    }

    // 1.5 INTENT: Promociones del día o de la semana (100% en tiempo real sincronizado con la base de datos)
    const isCategoryPromoInquiry =
      /\b(pollo|pollos|fruver|fruta|frutas|verdura|verduras|hortaliza|hortalizas|carne|carnes|res|cerdo|cerdos|pescado|pescados|aseo|aseos|limpieza)\b/.test(
        norm,
      ) &&
      /\b(dia|promo|promos|promocion|promociones|descuento|descuentos|oferta|ofertas|cuando|precio|precios|que dia)\b/.test(
        norm,
      );

    const isPromoInquiry =
      (
        /\b(promo|promos|promocion|promociones|descuento|descuentos|ahorro|ahorros|rebaja|rebajas|ganga|gangas)\b/.test(
          norm,
        ) ||
        (/\b(oferta|ofertas)\b/.test(norm) && !isJobInquiry) ||
        isCategoryPromoInquiry ||
        /\b(que hay hoy|que tienen hoy|ofertas hoy|promo hoy|promociones hoy|que hay de promo|promos de la semana)\b/.test(
          norm,
        )
      ) && !isJobInquiry;

    if (isPromoInquiry) {
      const diasNombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
      let diaSolicitado = diasNombres.find((d) => norm.includes(d));

      if (!diaSolicitado) {
        if (/\b(aseo|aseos|limpieza|detergente|detergentes)\b/.test(norm)) {
          diaSolicitado = "lunes";
        } else if (/\b(pollo|pollos)\b/.test(norm)) {
          diaSolicitado = "martes";
        } else if (/\b(fruver|fruta|frutas|verdura|verduras|hortaliza|hortalizas|cosecha)\b/.test(norm)) {
          diaSolicitado = "miercoles";
        } else if (/\b(carne|carnes|res)\b/.test(norm)) {
          diaSolicitado = "jueves";
        } else if (/\b(cerdo|cerdos|pescado|pescados|marisco|mariscos)\b/.test(norm)) {
          diaSolicitado = "viernes";
        }
      }

      const asksForToday = /\b(hoy|el dia de hoy|actual|dia de hoy)\b/.test(norm);
      let targetDay = diaSolicitado;

      if (!targetDay && asksForToday) {
        const diaSemanaIndex = new Date().getDay();
        targetDay = diasNombres[diaSemanaIndex];
      }

      if (targetDay && targetDay !== "sabado" && targetDay !== "domingo") {
        const promoDia = promos.find(
          (p) =>
            p.id.toLowerCase() === targetDay ||
            p.dayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === targetDay,
        );

        if (promoDia) {
          const highlightsList = (promoDia.highlights || []).map((h) => `• ${h}`).join("\n");
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              `🏷️ **${promoDia.dayName}: ${promoDia.title}** (${promoDia.badge})\n${promoDia.description}\n\n**Destacados del día:**\n${highlightsList}\n\n¿Deseas pedir un domicilio para aprovechar estas promociones?`,
              {
                intent: "promocion_dia",
              },
            ),
          ]);
          return;
        }
      }

      // Consulta general de todas las promociones de la semana
      const listaPromos = promos
        .map((p) => `• **${p.dayName} (${p.title}):** ${p.description}`)
        .join("\n");

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `🏷️ **Calendario de Promociones Semanales en Supermercados Betel:**\n\n${listaPromos}\n\nAdemás, todos los fines de semana tenemos ofertas especiales en todas nuestras sedes. Puedes elegir un día específico para ver sus detalles o pedir a domicilio:`,
          {
            intent: "promociones",
          },
        ),
      ]);
      return;
    }

    // 2. INTENT: Domicilios / Pedidos
    const isOrderInquiry = /\b(pedido|pedidos|domicilio|domicilios|domi|domis|comprar|compra|pedir|ordenar|llevar a casa|mercado a casa|mandar mercado|envio|envios)\b/.test(
      norm,
    );
    if (isOrderInquiry) {
      const store = findActiveStore(norm);
      if (store) {
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            `¡Excelente elección! 🚚 Para realizar tu pedido a domicilio en la sede **Betel ${store.nombre}**, comunícate al número **${store.telefono}**.\n\n📍 **Dirección:** ${store.direccion}\n🕒 **Horario:** ${store.horario || "Habitual"}${store.servicio_nocturno ? `\n🌙 **${store.servicio_nocturno}**` : ""}\n\nToca el botón a continuación para abrir WhatsApp y hacer tu pedido:`,
            { intent: "order_store", stores: [store] },
          ),
        ]);
        return;
      }

      if (matchedCity) {
        const cityStores = getStoresByMunicipio(matchedCity.key, sedesActions);
        if (cityStores.length === 1) {
          const single = cityStores[0];
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              `¡Excelente elección! 🚚 Para realizar tu pedido a domicilio en **${matchedCity.nombre} (Betel ${single.nombre})**, comunícate al número **${single.telefono}**.\n\n📍 **Dirección:** ${single.direccion}\n🕒 **Horario:** ${single.horario || "Habitual"}${single.servicio_nocturno ? `\n🌙 **${single.servicio_nocturno}**` : ""}\n\nToca el botón a continuación para abrir WhatsApp y hacer tu pedido:`,
              { intent: "order_store", stores: [single] },
            ),
          ]);
          return;
        }

        if (cityStores.length > 1) {
          setSelectingOrderStore(true);
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              `¡Con mucho gusto! 🚚 En **${matchedCity.nombre}** contamos con **${cityStores.length} sedes**.\n\nSelecciona a continuación tu sede más cercana para mostrarte su número directo en WhatsApp:`,
              { intent: "select_order_store", stores: cityStores, generalPhone: ATENCION_GENERAL_PHONE },
            ),
          ]);
          return;
        }
      }

      setSelectingOrderStore(true);
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `¡Con mucho gusto! 🚚 **¿De qué sede quieres pedir tu domicilio?**\n\nSelecciona tu sede a continuación entre nuestras ${sedesActions.length} sedes activas para mostrarte su número directo en WhatsApp:`,
          { intent: "select_order_store", stores: sedesActions, generalPhone: ATENCION_GENERAL_PHONE },
        ),
      ]);
      return;
    }

    // 3. INTENT: Consulta de sede específica (ej: "La Garita", "Boconó", etc.)
    const specificStore = findActiveStore(norm);
    const mentionsStoreKeywords = /\b(sede|sedes|donde|donde queda|donde estan|ubicacion|ubicado|direccion|direcciones|horario|horarios|telefono|telefonos|contacto|queda|quedan|abierto|maps|mapa|llegar|ruta|sucursal|sucursales|tienda|tiendas|puntos de venta)\b/.test(
      norm,
    );
    const isPromoSpecific = /\b(promo|promos|promocion|promociones|descuento|descuentos)\b/.test(norm);

    if (specificStore && !isPromoSpecific && (mentionsStoreKeywords || norm.length < 25)) {
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `📍 **Sede Supermercados Betel ${specificStore.nombre}** (${specificStore.ciudad || "Cúcuta"}):\n\n` +
            `• 📍 **Dirección:** ${specificStore.direccion}\n` +
            `• 📞 **Teléfono / WhatsApp:** ${specificStore.telefono}\n` +
            `• 🕒 **Horario de atención:** ${specificStore.horario || "Habitual"}\n` +
            `${specificStore.servicio_nocturno ? `• 🌙 **Servicio:** ${specificStore.servicio_nocturno}\n` : ""}` +
            `${specificStore.tiene_cafeteria ? `• ☕ **Cafetería:** Disponible (${specificStore.horario_cafeteria || "Horario habitual"})\n` : ""}` +
            `\nPuedes pulsar abajo para ver la ruta en **Google Maps** o escribir directamente por **WhatsApp**:`,
          {
            intent: "order_store",
            stores: [specificStore],
          },
        ),
      ]);
      return;
    }

    // 3.4 INTENT: Consulta de Municipio No Disponible (ej: El Zulia, Pamplona, Ocaña, Bucaramanga)
    if (matchedUnsupportedCity) {
      const cucutaCount = getStoresByMunicipio("cucuta", sedesActions).length;
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `📍 Actualmente **Supermercados Betel** no cuenta con tiendas físicas en el municipio de **${matchedUnsupportedCity.nombre}**.\n\n` +
            `Nuestras **${sedesActions.length} sedes activas** se encuentran ubicadas en:\n` +
            `• 🏙️ **Cúcuta** (${cucutaCount} sedes)\n` +
            `• 🏘️ **Los Patios** (Sede Los Patios)\n` +
            `• 🌳 **Villa del Rosario** (Sede Villa Mall)\n` +
            `• 🌄 **Chinácota** (Sede Chinácota)\n\n` +
            `¿Deseas consultar las direcciones de alguna de estas sedes o pedir a domicilio?`,
          {
            intent: "stores_list",
            stores: sedesActions,
            generalPhone: ATENCION_GENERAL_PHONE,
          },
        ),
      ]);
      return;
    }

    // 3.5 INTENT: Consulta de todas las tiendas de un Municipio o Ciudad
    if (matchedCity) {
      const cityStores = getStoresByMunicipio(matchedCity.key, sedesActions);
      if (cityStores.length === 1) {
        const singleStore = cityStores[0];
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            `📍 En **${matchedCity.nombre}** contamos con la sede **Betel ${singleStore.nombre}**:\n\n` +
              `• 📍 **Dirección:** ${singleStore.direccion}\n` +
              `• 📞 **Teléfono / WhatsApp:** ${singleStore.telefono}\n` +
              `• 🕒 **Horario de atención:** ${singleStore.horario || "Habitual"}\n` +
              `${singleStore.servicio_nocturno ? `• 🌙 **Servicio:** ${singleStore.servicio_nocturno}\n` : ""}` +
              `${singleStore.tiene_cafeteria ? `• ☕ **Cafetería:** Disponible (${singleStore.horario_cafeteria || "Horario habitual"})\n` : ""}` +
              `\nPuedes pulsar abajo para ver la ruta en **Google Maps** o escribir directamente por **WhatsApp**:`,
            {
              intent: "order_store",
              stores: [singleStore],
            },
          ),
        ]);
        return;
      }

      if (cityStores.length > 1) {
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            `📍 En **${matchedCity.nombre}** contamos con **${cityStores.length} sedes activas** de Supermercados Betel:\n\n` +
              `Encuentra a continuación cada una de nuestras tiendas en ${matchedCity.nombre}. Puedes pulsar **Abrir en Google Maps** en cualquiera de ellas para ver cómo llegar o escribir directamente a su **WhatsApp**:`,
            {
              intent: "stores_list",
              stores: cityStores,
              generalPhone: ATENCION_GENERAL_PHONE,
            },
          ),
        ]);
        return;
      }
    }

    // 4. INTENT: Cafeterías Betel
    const isCafeteriaQuery = /\b(cafeteria|cafeterias|cafe|tinto|desayuno|desayunos|almuerzo|almuerzos|panaderia|pasteleria|pastel|combos)\b/.test(
      norm,
    );
    if (isCafeteriaQuery) {
      const sedesCafeteria = sedesActions.filter((s) => s.tiene_cafeteria);
      const lista = sedesCafeteria
        .map(
          (s) =>
            `• **${s.nombre}** (${s.ciudad || "Cúcuta"}): ${s.horario_cafeteria || s.horario || "Horario habitual"} — Tel: ${s.telefono}`,
        )
        .join("\n");

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `☕ **Cafeterías y Panadería Betel:**\nDisfruta de café 100% colombiano recién molido, panadería y pastelería horneada cada mañana, desayunos tradicionales y combos especiales.\n\nContamos con servicio de Cafetería en estas **${sedesCafeteria.length} sedes**:\n${lista}\n\nPuedes pulsar abajo para ver la ubicación en Maps o comunicarte por WhatsApp:`,
          {
            intent: "stores_list",
            stores: sedesCafeteria,
          },
        ),
      ]);
      return;
    }

    // 5. INTENT: 24 Horas y Ventanilla Nocturna
    const sedes24 = sedesActions.filter(
      (s) => s.es_24_horas || /24\s*horas/i.test(s.horario || ""),
    );
    const sedesVentanilla = sedesActions.filter(
      (s) => s.tiene_ventanilla || Boolean(s.servicio_nocturno),
    );

    const is24hQuery =
      /\b(24 horas|24h|24 hs|veinticuatro horas|24 hora|abierto 24|abren 24|sede 24|sedes 24|tienda 24|tiendas 24)\b/.test(
        norm,
      );

    const isVentanillaQuery =
      /\b(ventanilla|ventanillas|bentanilla|bentanillas|ventanilla nocturna|comprar por ventanilla)\b/.test(
        norm,
      );

    const isGeneralNightQuery =
      /\b(nocturn[ao]|de noche|madrugada|abierto de noche|servicio nocturno|atencion nocturna|horario nocturno)\b/.test(
        norm,
      );

    // A. Preguntó específicamente por sedes 24 Horas
    if (is24hQuery && !isVentanillaQuery) {
      const lista24 = sedes24
        .map(
          (s) =>
            `• 🟢 **${s.nombre}** (${s.ciudad || "Cúcuta"}): ${s.direccion} — Tel: ${s.telefono} (${s.horario || "Abierto las 24 horas"})`,
        )
        .join("\n");

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `🌙 **Sedes de Supermercados Betel Abiertas las 24 Horas:**\n\n` +
            `Contamos con **${sedes24.length} sedes abiertas las 24 horas** de forma ininterrumpida:\n` +
            `${lista24}\n\n` +
            `*(Nota: También contamos con **${sedesVentanilla.length} sedes adicionales con Ventanilla Nocturna** para atención en la noche y madrugada).*` +
            `\n\nPuedes pulsar en cualquiera de ellas abajo para abrir en **Google Maps** o escribir a su **WhatsApp**:`,
          {
            intent: "stores_list",
            stores: sedes24,
            generalPhone: ATENCION_GENERAL_PHONE,
          },
        ),
      ]);
      return;
    }

    // B. Preguntó específicamente por sedes con Ventanilla Nocturna
    if (isVentanillaQuery && !is24hQuery) {
      const listaVentanilla = sedesVentanilla
        .map(
          (s) =>
            `• 🪟 **${s.nombre}** (${s.ciudad || "Cúcuta"}): ${s.servicio_nocturno || "Ventanilla nocturna"} — Tel: ${s.telefono}`,
        )
        .join("\n");

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `🪟 **Sedes de Supermercados Betel con Ventanilla Nocturna:**\n\n` +
            `Para tus compras en horario de la noche y madrugada, contamos con servicio de ventanilla en estas **${sedesVentanilla.length} sedes**:\n` +
            `${listaVentanilla}\n\n` +
            `*(Nota: Recuerda que además contamos con **${sedes24.length} sedes 100% 24 Horas**: Prados del Este y Villa Mall).*` +
            `\n\nPuedes pulsar en cualquiera de ellas abajo para ver su ubicación en **Google Maps** o escribir por **WhatsApp**:`,
          {
            intent: "stores_list",
            stores: sedesVentanilla,
            generalPhone: ATENCION_GENERAL_PHONE,
          },
        ),
      ]);
      return;
    }

    // C. Preguntó por servicio nocturno en general o por ambas (24h y ventanilla)
    if (isGeneralNightQuery || (is24hQuery && isVentanillaQuery)) {
      const lista24 = sedes24
        .map((s) => `• 🟢 **${s.nombre}** (${s.ciudad || "Cúcuta"}): Abierto las 24 horas — Tel: ${s.telefono}`)
        .join("\n");
      const listaVentanilla = sedesVentanilla
        .map(
          (s) =>
            `• 🪟 **${s.nombre}** (${s.ciudad || "Cúcuta"}): ${s.servicio_nocturno || "Ventanilla nocturna"} — Tel: ${s.telefono}`,
        )
        .join("\n");

      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `🌙 **Atención Nocturna y 24 Horas en Supermercados Betel:**\n\n` +
            `🟢 **Sedes Abiertas las 24 Horas (${sedes24.length}):**\n${lista24}\n\n` +
            `🪟 **Sedes con Ventanilla Nocturna (${sedesVentanilla.length}):**\n${listaVentanilla}\n\n` +
            `¡Siempre listos para atenderte a cualquier hora! Puedes pulsar abajo para ver la ruta en **Google Maps** o escribir por **WhatsApp**:`,
          {
            intent: "stores_list",
            stores: [...sedes24, ...sedesVentanilla],
            generalPhone: ATENCION_GENERAL_PHONE,
          },
        ),
      ]);
      return;
    }

    // 6. INTENT: Consulta general de sedes / direcciones / puntos de venta
    const isAllStoresQuery =
      /\b(sedes|sede|sucursales|sucursal|tiendas|tienda|puntos de venta|donde estan|donde quedan|donde los encuentro|donde estan ubicados|ubicaciones|direcciones|lista de tiendas|lista de sedes)\b/.test(
        norm,
      ) &&
      !/\b(cafeteria|cafeterias|promo|promocion|promociones|descuento|24 horas|24h|24 hs|veinticuatro horas|ventanilla|ventanillas|bentanilla|nocturn|madrugada)\b/.test(
        norm,
      );

    if (isAllStoresQuery) {
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `📍 **Nuestras ${sedesActions.length} Sedes Activas de Supermercados Betel:**\n\nEncuentra a continuación cada una de nuestras sedes. Puedes pulsar **Abrir en Google Maps** para ver cómo llegar o escribir directamente a su **WhatsApp**:`,
          {
            intent: "stores_list",
            stores: sedesActions,
            generalPhone: ATENCION_GENERAL_PHONE,
          },
        ),
      ]);
      return;
    }

    // Si está en flujo interactivo paso a paso de PQRS (cuando ENABLE_PQRS_FLOW === true)
    if (ENABLE_PQRS_FLOW && showCaseForm && caseStep) {
      await answerCaseStep(text);
      return;
    }

    // Si pregunta por consultar radicado en texto libre y el flujo PQRS está habilitado
    if (ENABLE_PQRS_FLOW && isStatusLookupRequest(text)) {
      openStatusLookup();
      return;
    }

    setSending(true);
    try {
      const contexto = [...messages].reverse().find((m) => m.role === "assistant")?.text ?? "";
      const data = await callPqrsChat({
        action: "chat",
        message: text,
        contexto,
        session_id: session,
      });

      if (typeof data?.reply !== "string" || !data.reply.trim()) throw new Error("Respuesta vacía");

      const intent = (data.intent as ChatIntent) || "general";
      const storesFromApi = Array.isArray(data.stores) && data.stores.length > 0 ? (data.stores as ChatStoreAction[]) : undefined;

      if (intent === "select_order_store") {
        setSelectingOrderStore(true);
      }

      let replyText = data.reply.trim();
      if (intent === "stores_list") {
        replyText = replyText.replace(/10\s*sedes/gi, `${sedesActions.length} sedes`);
      }

      setMessages((current) => [
        ...current,
        newMessage("assistant", replyText, {
          intent,
          stores:
            intent === "stores_list" || intent === "select_order_store"
              ? sedesActions
              : storesFromApi,
          generalPhone: data.generalPhone || ATENCION_GENERAL_PHONE,
        }),
      ]);
    } catch {
      // Fallback local inteligente en caso de que no haya conexión momentánea
      const matchedStore = findActiveStore(norm);

      if (/\b(pqrs|queja|reclamo|peticion|sugerencia|asesor)\b/.test(norm)) {
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            `Para atender tus PQRS o hablar con un asesor, comunícate con **Atención General Betel** al **Tel: ${ATENCION_GENERAL_DISPLAY}**:`,
            { intent: "pqrs_general", generalPhone: ATENCION_GENERAL_PHONE },
          ),
        ]);
      } else if (/\b(domicilio|pedido|pedir|comprar)\b/.test(norm)) {
        if (matchedStore) {
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              `Para pedir tu domicilio en **Betel ${matchedStore.nombre}**, comunícate al **${matchedStore.telefono}**:`,
              { intent: "order_store", stores: [matchedStore] },
            ),
          ]);
        } else {
          setSelectingOrderStore(true);
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              "¡Con mucho gusto! 🚚 **¿De qué sede quieres pedir tu domicilio?** Selecciona una sede a continuación:",
              { intent: "select_order_store", stores: sedesActions },
            ),
          ]);
        }
      } else {
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            `Aquí tienes nuestras sedes y la línea de **Atención General Betel (${ATENCION_GENERAL_DISPLAY})**:`,
            { intent: "stores_list", stores: sedesActions, generalPhone: ATENCION_GENERAL_PHONE },
          ),
        ]);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const openCaseForm = (type: TipoCaso) => {
    if (!ENABLE_PQRS_FLOW) {
      showAtencionGeneralPqrs();
      return;
    }
    setCaseType(type);
    setCaseData({ nombre: "", telefono: "", correo: "", tienda: "", descripcion: "" });
    setShowCaseForm(true);
    setCaseStep("initial-consent");
    setMessages((current) => [
      ...current,
      newMessage(
        "assistant",
        "🔒 **Paso 1 de 7 — Autorización de Tratamiento de Datos:**\n\nTe guiaré paso a paso para radicar tu caso oficial ante Supermercados Betel.\n\nPara poder gestionar tu solicitud y notificarte la respuesta, ¿autorizas el tratamiento de tus datos de contacto conforme a nuestra política de protección de datos?\n\n👇 **Selecciona una de las opciones abajo para continuar:**",
      ),
    ]);
  };

  const openStatusLookup = () => {
    if (!ENABLE_PQRS_FLOW) {
      showAtencionGeneralPqrs();
      return;
    }
    setShowCaseForm(true);
    setCaseStep("status-code");
    setMessages((current) => [
      ...current,
      newMessage(
        "assistant",
        "🔍 **Consulta de Estado de Solicitud:**\n\nPor favor escribe el código alfanumérico de tu solicitud en el **campo de texto de abajo 👇** *(ejemplo: 8 a 16 caracteres)* para verificar su estado en tiempo real.",
      ),
    ]);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const answerCaseStep = async (answer: string) => {
    const value = answer.trim();
    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (["cancelar", "salir", "no gracias"].includes(normalized)) {
      setShowCaseForm(false);
      setCaseStep(null);
      setMessages((current) => [
        ...current,
        newMessage("user", value),
        newMessage("assistant", "Entendido. He cancelado el proceso y no registré ninguna solicitud. Si necesitas algo más, aquí estoy para ayudarte."),
      ]);
      return;
    }

    if (caseStep === "initial-consent") {
      setMessages((current) => [...current, newMessage("user", value)]);
      if (/\b(si|acepto|autorizo|de acuerdo|claro|por supuesto)\b/.test(normalized)) {
        setCaseStep("type");
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            "📋 **Paso 2 de 7 — Tipo de Solicitud:**\n¿Qué tipo de trámite deseas radicar ante Supermercados Betel?\n\n👇 **Selecciona una de las opciones tocando los botones:**",
          ),
        ]);
      } else {
        setShowCaseForm(false);
        setCaseStep(null);
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            "Comprendo. Sin tu autorización no podemos registrar tus datos ni abrir el caso. Si deseas consultar otra información, aquí estaré.",
          ),
        ]);
      }
      return;
    }

    if (caseStep === "type") {
      setMessages((current) => [...current, newMessage("user", value)]);
      const mapeoTipo: Record<string, TipoCaso> = {
        peticion: "PETICION",
        queja: "QUEJA",
        reclamo: "RECLAMO",
        sugerencia: "SUGERENCIA",
        asesor: "ASESOR",
      };
      const elegido = mapeoTipo[normalized] ?? caseType;
      setCaseType(elegido);
      setCaseStep("name");
      setMessages((current) => [
        ...current,
        newMessage("assistant", "✍️ **Paso 3 de 7 — Tu Nombre Completo:**\nPor favor escribe tu nombre y apellido en el **campo de texto de abajo 👇**"),
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (caseStep === "name") {
      setMessages((current) => [...current, newMessage("user", value)]);
      if (value.length < 2 || value.length > 120) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Por favor escribe tu nombre completo (mínimo 2 letras) en el **campo de texto de abajo 👇**"),
        ]);
        setTimeout(() => inputRef.current?.focus(), 150);
        return;
      }
      setCaseData((prev) => ({ ...prev, nombre: value }));
      setCaseStep("phone");
      setMessages((current) => [
        ...current,
        newMessage("assistant", "📱 **Paso 4 de 7 — Teléfono o Celular:**\nEscribe tu número de celular o teléfono en el **campo de texto de abajo 👇** para notificarte avances y respuestas."),
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (caseStep === "phone") {
      setMessages((current) => [...current, newMessage("user", value)]);
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length < 7 || value.length > 20) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Por favor escribe un número de teléfono válido de al menos 7 dígitos en el **campo de texto de abajo 👇**"),
        ]);
        setTimeout(() => inputRef.current?.focus(), 150);
        return;
      }
      setCaseData((prev) => ({ ...prev, telefono: soloNumeros }));
      setCaseStep("email");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "✉️ **Paso 5 de 7 — Correo Electrónico (Opcional):**\nEscribe tu correo en el **campo de texto de abajo 👇**, o pulsa el botón **«Omitir correo»** si no tienes.",
        ),
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (caseStep === "email") {
      setMessages((current) => [...current, newMessage("user", value)]);
      const omitir = /\b(omitir|no|ninguno|saltar|pasar)\b/.test(normalized);
      if (!omitir && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "El correo no tiene un formato válido. Puedes corregirlo en el **campo de texto de abajo 👇** o presionar el botón **«Omitir correo»**."),
        ]);
        setTimeout(() => inputRef.current?.focus(), 150);
        return;
      }
      setCaseData((prev) => ({ ...prev, correo: omitir ? "" : value }));
      setCaseStep("store");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "🏬 **Paso 6 de 7 — Sede Relacionada (Opcional):**\n¿En cuál de nuestras sedes ocurrieron los hechos?\n\n👇 **Toca tu sede en los botones de abajo o presiona «Omitir sede»:**",
        ),
      ]);
      return;
    }

    if (caseStep === "store") {
      setMessages((current) => [...current, newMessage("user", value)]);
      const omitir = /\b(omitir|ninguna|no se|general)\b/.test(normalized);
      const matchedStore = sedesActions.find(
        (s) =>
          s.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalized ||
          normalized.includes(s.nombre.toLowerCase()),
      );
      const tienda = omitir ? "" : matchedStore?.nombre || value;
      setCaseData((prev) => ({ ...prev, tienda }));
      setCaseStep("description");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "📝 **Paso 7 de 7 — Detalle de lo sucedido:**\nPor favor describe con claridad lo ocurrido o tu inconformidad en el **campo de texto de abajo 👇** *(mínimo 10 caracteres)*.",
        ),
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (caseStep === "description") {
      setMessages((current) => [...current, newMessage("user", value)]);
      if (value.length < 10) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "La descripción debe tener al menos 10 caracteres para que nuestro equipo pueda atenderte adecuadamente. Escríbela en el **campo de texto de abajo 👇**"),
        ]);
        setTimeout(() => inputRef.current?.focus(), 150);
        return;
      }
      const dataFinal = { ...caseData, descripcion: value };
      setCaseData(dataFinal);
      setCaseStep("consent");

      const tipoLabels: Record<TipoCaso, string> = {
        PETICION: "Petición",
        QUEJA: "Queja",
        RECLAMO: "Reclamo",
        SUGERENCIA: "Sugerencia",
        ASESOR: "Asesor",
      };
      const tipoDisplay = tipoLabels[caseType] || caseType;

      const resumenTexto =
        `📋 **RESUMEN DE TU SOLICITUD DE PQRS**\n\n` +
        `Por favor verifica que todos tus datos estén correctos antes de enviarla:\n\n` +
        `• **Tipo de solicitud:** ${tipoDisplay}\n` +
        `• **Nombre del solicitante:** ${dataFinal.nombre}\n` +
        `• **Teléfono de contacto:** ${dataFinal.telefono}\n` +
        `• **Correo electrónico:** ${dataFinal.correo || "*(No registrado / Omitido)*"}\n` +
        `• **Sede relacionada:** ${dataFinal.tienda ? `Supermercado Betel ${dataFinal.tienda}` : "*(General / No especificada)*"}\n` +
        `• **Detalle de lo ocurrido:**\n` +
        `> "${dataFinal.descripcion}"\n\n` +
        `👇 **¿Confirmas que la información es correcta para radicarla oficialmente ante Supermercados Betel?**`;

      setMessages((current) => [
        ...current,
        newMessage("assistant", resumenTexto, {
          resumenPqrs: {
            tipo: tipoDisplay,
            nombre: dataFinal.nombre,
            telefono: dataFinal.telefono,
            correo: dataFinal.correo,
            tienda: dataFinal.tienda,
            descripcion: dataFinal.descripcion,
          },
        }),
      ]);
      return;
    }

    if (caseStep === "consent") {
      setMessages((current) => [...current, newMessage("user", value)]);
      if (/\b(si|confirmar|enviar|radicar|correcto|de acuerdo)\b/.test(normalized)) {
        setSending(true);
        try {
          const res = await callPqrsChat({
            action: "register",
            session_id: session,
            tipo: caseType,
            nombre: caseData.nombre,
            telefono: caseData.telefono,
            correo: caseData.correo,
            tienda: caseData.tienda,
            descripcion: caseData.descripcion,
            consentimiento: true,
            website: "",
          });

          const codigo = res.codigo;
          setShowCaseForm(false);
          setCaseStep(null);
          setMessages((current) => [
            ...current,
            newMessage(
              "assistant",
              `🎉 **¡Tu solicitud ha sido radicada con éxito en Supermercados Betel!**\n\nTu código de radicado oficial es:\n👉 **${codigo}**\n\nNuestro equipo atenderá tu caso en los términos legales vigentes. Guarda este código para consultar el avance en cualquier momento desde este chat o con nuestro equipo.`,
              { isRadicado: true, radicadoCodigo: codigo },
            ),
          ]);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Error al registrar la solicitud.";
          setMessages((current) => [
            ...current,
            newMessage("assistant", `Hubo un inconveniente al radicar la solicitud: ${errorMsg}. Presiona **«Sí, confirmar y radicar PQRS»** para intentar de nuevo o **«Cancelar»** para salir.`),
          ]);
        } finally {
          setSending(false);
        }
      } else {
        setShowCaseForm(false);
        setCaseStep(null);
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Radicación cancelada. Tu solicitud no ha sido enviada. ¿En qué más puedo ayudarte?"),
        ]);
      }
      return;
    }

    if (caseStep === "status-code") {
      setMessages((current) => [...current, newMessage("user", value)]);
      const codigo = value.replace(/[\s-]/g, "").toUpperCase();
      if (!/^[A-F0-9]{8,16}$/.test(codigo)) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "El código debe tener entre 8 y 16 letras o números. Por favor revísalo y escríbelo de nuevo en el **campo de texto de abajo 👇**"),
        ]);
        setTimeout(() => inputRef.current?.focus(), 150);
        return;
      }
      setSending(true);
      try {
        const data = await callPqrsChat({
          action: "status",
          codigo,
        });

        setShowCaseForm(false);
        setCaseStep(null);

        if (!data?.found) {
          setMessages((current) => [
            ...current,
            newMessage("assistant", "No encontré una solicitud con ese código en el sistema. Verifica que esté bien escrito e inténtalo de nuevo en el **campo de texto de abajo 👇**"),
          ]);
          setTimeout(() => inputRef.current?.focus(), 150);
        } else {
          const labels: Record<string, string> = {
            PENDIENTE: "Recibida; está pendiente de revisión por el equipo Betel.",
            EN_GESTION: "En gestión activa: el equipo Betel está atendiendo tu caso.",
            RESUELTA: "Tu solicitud ha sido resuelta satisfactoriamente.",
          };
          const estado = labels[data.estado] ?? "El estado no está disponible.";
          const respuesta =
            typeof data.respuesta === "string" && data.respuesta.trim()
              ? `\n\n📌 Respuesta del equipo Betel:\n"${data.respuesta.trim()}"`
              : "";
          setMessages((current) => [
            ...current,
            newMessage("assistant", `📋 **Solicitud ${data.codigo}:**\n• Estado: **${estado}**${respuesta}`),
          ]);
        }
      } catch {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "No pude consultar la solicitud en este momento. Inténtalo de nuevo más tarde."),
        ]);
      } finally {
        setSending(false);
      }
    }
  };

  const isTypingStep = Boolean(
    ENABLE_PQRS_FLOW &&
      showCaseForm &&
      (caseStep === "name" ||
        caseStep === "phone" ||
        caseStep === "email" ||
        caseStep === "description" ||
        caseStep === "status-code"),
  );

  const getInputPlaceholder = () => {
    if (ENABLE_PQRS_FLOW && showCaseForm && caseStep) {
      switch (caseStep) {
        case "name":
          return "✍️ Escribe tu nombre completo aquí (Ej: Juan Pérez)...";
        case "phone":
          return "📱 Escribe tu número de celular o teléfono aquí...";
        case "email":
          return "✉️ Escribe tu correo aquí (o presiona Omitir correo arriba)...";
        case "description":
          return "📝 Describe lo sucedido con claridad aquí (mínimo 10 caracteres)...";
        case "status-code":
          return "🔍 Escribe tu código de radicado aquí (ej: 8-16 dígitos)...";
        default:
          return "Selecciona una opción arriba para continuar…";
      }
    }
    if (selectingOrderStore) return "Elige una sede arriba o escríbela aquí…";
    return "Pregunta por domicilios, sedes, promociones, cafeterías…";
  };

  return (
    <div
      className={`flex h-full flex-col overflow-hidden ${
        isExpanded ? "rounded-2xl" : "rounded-3xl"
      } border border-lime-200/80 bg-[#fffdf8] shadow-2xl`}
    >
      {/* Encabezado Verde Bosque Institucional */}
      <header className="relative flex shrink-0 items-center justify-between border-b border-lime-500/20 bg-gradient-to-r from-emerald-950 via-[#12351d] to-[#092b17] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl border border-lime-400/40 bg-white/15 p-0.5 backdrop-blur-md shadow-inner">
            <img
              src={assetPath("/chatbot-avatar.png")}
              alt="Asistente Betel"
              className="size-full object-contain"
            />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#12351d] bg-lime-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black leading-tight tracking-tight text-white">
                Asistente Betel
              </h2>
              <span className="rounded-full bg-lime-400/20 px-1.5 py-0.5 text-[9px] font-bold text-lime-300">
                En línea
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-200/80">
              Domicilios, Sedes en Maps e Info Betel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resetChat}
            title="Reiniciar conversación"
            aria-label="Reiniciar conversación"
            className="flex size-8 items-center justify-center rounded-xl text-emerald-200 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={15} />
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              title={isExpanded ? "Reducir ventana" : "Ampliar chat"}
              aria-label={isExpanded ? "Reducir ventana" : "Ampliar chat"}
              className="flex size-8 items-center justify-center rounded-xl text-emerald-200 transition hover:bg-white/10 hover:text-white"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          {isWidget && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Cerrar chat"
              aria-label="Cerrar chat de ayuda"
              className="flex size-8 items-center justify-center rounded-xl text-emerald-200 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Barra de progreso interactiva si está en radicación PQRS (solo cuando ENABLE_PQRS_FLOW === true) */}
      {ENABLE_PQRS_FLOW && showCaseForm && caseStep && STEP_LABELS[caseStep] && (
        <div className="border-b border-lime-100 bg-emerald-50/80 px-4 py-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-900">
              Paso {STEP_LABELS[caseStep].paso} de {STEP_LABELS[caseStep].total}: {STEP_LABELS[caseStep].label}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowCaseForm(false);
                setCaseStep(null);
                setMessages((c) => [...c, newMessage("assistant", "Trámite cancelado. ¿Qué otra duda tienes?")]);
              }}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Cancelar
            </button>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/60">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{
                width: `${(STEP_LABELS[caseStep].paso / STEP_LABELS[caseStep].total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Historial de Mensajes */}
      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4 overscroll-contain">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/95 border border-emerald-200/90 shadow-2xs overflow-hidden p-0.5">
                  <img
                    src={assetPath("/chatbot-avatar.png")}
                    alt="Asistente Betel"
                    className="size-full object-contain"
                  />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "rounded-br-xs bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-medium"
                    : "rounded-bl-xs border border-slate-200/80 bg-white text-slate-700"
                }`}
              >
                <div className="whitespace-pre-line break-words">
                  {isUser ? message.text : renderFormattedText(message.text)}
                </div>

                {/* 1. Tarjeta de Atención General Betel (317 679 7058) para PQRS y Atención al Cliente */}
                {message.intent === "pqrs_general" && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-lime-50/50 p-3 text-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Atención General Betel · PQRS
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-black text-emerald-950">
                          Tel: {ATENCION_GENERAL_DISPLAY}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Canal Oficial
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <a
                        href={buildWhatsAppGeneralUrl(message.generalPhone || ATENCION_GENERAL_PHONE)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
                      >
                        <MessageCircle size={14} /> Abrir en WhatsApp
                      </a>
                      <a
                        href={`tel:${message.generalPhone || ATENCION_GENERAL_PHONE}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 transition active:scale-95"
                      >
                        <Phone size={14} /> Llamar
                      </a>
                    </div>
                  </div>
                )}

                {/* 2. Selector de Sede para Pedir Domicilio */}
                {message.intent === "select_order_store" && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-orange-200/80 bg-orange-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                      Elige tu sede para pedir domicilio:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {(message.stores && message.stores.length > 0 ? message.stores : sedesActions).map((st) => (
                        <button
                          key={st.nombre}
                          type="button"
                          onClick={() => handleSelectOrderStore(st)}
                          className="flex flex-col items-start rounded-xl border border-orange-200/90 bg-white px-2.5 py-2 text-left transition hover:border-orange-500 hover:bg-orange-50 active:scale-95 shadow-2xs"
                        >
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                            <ShoppingBag size={11} className="text-orange-500 shrink-0" />
                            <span className="truncate">{st.nombre}</span>
                          </span>
                          <span className="mt-0.5 text-[10px] font-mono text-slate-500">
                            {st.telefono}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2.5 Promociones Semanales: Explorar por día o pedir domicilio paso a paso */}
                {message.intent === "promociones" && (
                  <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Explorar por día:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {promos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => sendMessage(undefined, `Ofertas de ${p.dayName}`)}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-900 transition active:scale-95 shadow-2xs"
                        >
                          <Tag size={11} className="text-emerald-600" />
                          <span>{p.dayName}</span>
                        </button>
                      ))}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={startOrderFlow}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
                      >
                        <ShoppingBag size={14} />
                        Pedir a domicilio (Elegir sede)
                      </button>
                    </div>
                  </div>
                )}

                {/* 2.6 Promoción de Día Específico: Pedir domicilio o ver toda la semana */}
                {message.intent === "promocion_dia" && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2.5">
                    <button
                      type="button"
                      onClick={startOrderFlow}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
                    >
                      <ShoppingBag size={14} />
                      Pedir a domicilio esta oferta
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage(undefined, "Promociones de la semana")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition active:scale-95"
                    >
                      <Tag size={13} className="text-slate-500" />
                      Ver toda la semana
                    </button>
                  </div>
                )}

                {/* 3. Tarjeta de Domicilio de una Sede Específica (WhatsApp + Google Maps) */}
                {(message.intent === "order_store" || message.intent === "store_info") &&
                  message.stores &&
                  message.stores.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.stores.map((st) => (
                        <div
                          key={st.nombre}
                          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-emerald-950">
                              Betel {st.nombre}
                            </span>
                            <span className="rounded-lg bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-900">
                              {st.telefono}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600">{st.direccion}</p>
                          <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row">
                            <a
                              href={buildWhatsAppOrderUrl(st.telefono, st.nombre)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
                            >
                              <MessageCircle size={14} /> Pedir por WhatsApp ({st.telefono})
                            </a>
                            <a
                              href={buildGoogleMapsUrl(st)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 px-3 py-2 text-xs font-bold text-slate-800 transition active:scale-95"
                            >
                              <MapPin size={14} className="text-orange-500" /> Abrir en Maps
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* 4. Lista interactiva de Sedes con botón directo a Google Maps y WhatsApp */}
                {message.intent === "stores_list" && message.stores && message.stores.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {message.stores.map((st) => (
                      <div
                        key={st.nombre}
                        className="flex flex-col gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900">
                              {st.nombre}{" "}
                              {st.ciudad && (
                                <span className="font-normal text-[10px] text-slate-500">
                                  ({st.ciudad})
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-snug">{st.direccion}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <a
                            href={buildGoogleMapsUrl(st)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-white hover:bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-800 transition active:scale-95"
                          >
                            <MapPin size={12} className="text-orange-500" /> Abrir en Google Maps
                            <ExternalLink size={10} />
                          </a>
                          <a
                            href={buildWhatsAppOrderUrl(st.telefono, st.nombre)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white transition active:scale-95"
                          >
                            <MessageCircle size={12} /> WhatsApp {st.telefono}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Botones rápidos para Vacantes / Trabaja con nosotros */}
                {message.intent === "vacantes" && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2.5">
                    <a
                      href={`https://wa.me/57${RRHH_WHATSAPP}?text=${encodeURIComponent("Hola Selección Betel, deseo enviar mi hoja de vida para postularme a una vacante")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                    >
                      <MessageCircle size={13} /> WhatsApp RRHH (317 517 7648)
                    </a>
                    <a
                      href="#trabaja"
                      onClick={() => {
                        if (isWidget && onClose) onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition"
                    >
                      <Briefcase size={13} className="text-orange-500" /> Ver Vacantes en la Web
                    </a>
                  </div>
                )}

                {/* Resumen de la Solicitud antes del envío final */}
                {message.resumenPqrs && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-slate-800 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                      <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[11px] text-emerald-950">
                        <FileText size={14} className="text-emerald-600" />
                        Resumen de la Solicitud
                      </span>
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                        {message.resumenPqrs.tipo}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-[11px]">
                      <div className="rounded-xl bg-white/90 p-2 border border-emerald-100">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Solicitante</span>
                        <span className="font-semibold text-slate-900">{message.resumenPqrs.nombre}</span>
                      </div>
                      <div className="rounded-xl bg-white/90 p-2 border border-emerald-100">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Teléfono</span>
                        <span className="font-semibold text-slate-900">{message.resumenPqrs.telefono}</span>
                      </div>
                      <div className="rounded-xl bg-white/90 p-2 border border-emerald-100">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Correo</span>
                        <span className="font-semibold text-slate-900">{message.resumenPqrs.correo || "No registrado (Omitido)"}</span>
                      </div>
                      <div className="rounded-xl bg-white/90 p-2 border border-emerald-100">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Sede</span>
                        <span className="font-semibold text-slate-900">{message.resumenPqrs.tienda ? `Betel ${message.resumenPqrs.tienda}` : "General / No especificada"}</span>
                      </div>
                    </div>

                    <div className="mt-2 rounded-xl bg-white/95 p-2.5 border border-emerald-100">
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Detalle de lo ocurrido</span>
                      <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed italic">
                        "{message.resumenPqrs.descripcion}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Tarjeta de Radicado Oficial (cuando ENABLE_PQRS_FLOW === true) */}
                {message.isRadicado && message.radicadoCodigo && (
                  <div className="mt-3 overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/70 p-3 text-slate-900">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      <ShieldCheck size={14} /> Código de Radicado Oficial
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-black tracking-widest text-emerald-950">
                        {message.radicadoCodigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(message.radicadoCodigo!)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                      >
                        {copiedCode === message.radicadoCodigo ? (
                          <>
                            <Check size={14} /> ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-right font-mono text-[10px] ${
                    isUser ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {message.time}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de escribiendo */}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1 rounded-2xl border border-emerald-100 bg-white px-3.5 py-2 shadow-xs">
              <span className="size-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-2 rounded-full bg-emerald-600 animate-bounce" />
              <span className="ml-1 text-[11px] font-semibold text-emerald-800">
                Betel está escribiendo…
              </span>
            </div>
          </div>
        )}

        {/* Chips de respuestas rápidas durante el flujo de caso PQRS (solo cuando ENABLE_PQRS_FLOW === true) */}
        {ENABLE_PQRS_FLOW && showCaseForm && caseStep && (
          <div className="space-y-2.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-md">
            {/* Header explicativo de la acción requerida */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                {caseStep === "initial-consent" && "🔒 Paso 1 de 7: Autorización de datos"}
                {caseStep === "type" && "📋 Paso 2 de 7: Tipo de solicitud"}
                {caseStep === "name" && "✍️ Paso 3 de 7: Tu nombre"}
                {caseStep === "phone" && "📱 Paso 4 de 7: Teléfono de contacto"}
                {caseStep === "email" && "✉️ Paso 5 de 7: Correo (Opcional)"}
                {caseStep === "store" && "🏬 Paso 6 de 7: Sede (Opcional)"}
                {caseStep === "description" && "📝 Paso 7 de 7: Describe tu caso"}
                {caseStep === "consent" && "✅ Confirmación final de envío"}
                {caseStep === "status-code" && "🔍 Consulta de radicado"}
              </span>
              <button
                type="button"
                onClick={() => void answerCaseStep("Cancelar")}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                Cancelar
              </button>
            </div>

            {/* Opciones según el paso */}
            {caseStep === "initial-consent" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void answerCaseStep("Sí")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-emerald-800 active:scale-95"
                >
                  <Check size={14} /> Sí, autorizo el tratamiento
                </button>
                <button
                  type="button"
                  onClick={() => void answerCaseStep("No")}
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  No autorizo
                </button>
              </div>
            )}

            {caseStep === "type" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Petición", desc: "Requerimiento o consulta oficial", icon: "🙋‍♂️" },
                  { id: "Queja", desc: "Inconformidad con atención o servicio", icon: "⚠️" },
                  { id: "Reclamo", desc: "Disconformidad con producto o cobro", icon: "🔄" },
                  { id: "Sugerencia", desc: "Propuesta de mejora para Betel", icon: "💡" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void answerCaseStep(item.id)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-100 active:scale-95"
                  >
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>{item.icon}</span> {item.id}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Si es un paso que requiere escribir, guía visual con flecha animada */}
            {isTypingStep && (
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-950">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white font-bold animate-bounce">
                  ↓
                </span>
                <div className="flex-1 text-[11px] leading-tight">
                  <p className="font-bold">Escribe en el campo de texto inferior:</p>
                  <p className="text-amber-800">
                    {caseStep === "name" && "Ingresa tu nombre y apellido completo"}
                    {caseStep === "phone" && "Ingresa tu celular o teléfono (mínimo 7 dígitos)"}
                    {caseStep === "email" && "Ingresa tu correo o presiona el botón 'Omitir' al lado"}
                    {caseStep === "description" && "Explica detalladamente tu inquietud (mínimo 10 caracteres)"}
                    {caseStep === "status-code" && "Ingresa tu código alfanumérico de radicado"}
                  </p>
                </div>
                {caseStep === "email" && (
                  <button
                    type="button"
                    onClick={() => void answerCaseStep("omitir")}
                    className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Omitir correo ⏭️
                  </button>
                )}
              </div>
            )}

            {caseStep === "store" && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500">
                  Toca la sede relacionada o presiona omitir si es un caso general:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {sedes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => void answerCaseStep(s.name)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                    >
                      <MapPin size={12} className="text-orange-500" />
                      {s.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void answerCaseStep("Omitir")}
                    className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Omitir sede ⏭️
                  </button>
                </div>
              </div>
            )}

            {caseStep === "consent" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-2.5 text-xs text-emerald-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" />
                    Revisa el resumen de tu solicitud arriba
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-800">
                    Si todos tus datos están correctos, presiona confirmar para radicar y generar tu código oficial de seguimiento.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => void answerCaseStep("Sí")}
                    disabled={sending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-700/20 transition hover:from-emerald-700 hover:to-emerald-800 active:scale-95 disabled:opacity-50"
                  >
                    <Check size={15} />
                    {sending ? "Radicando tu solicitud..." : "Sí, confirmar y radicar PQRS"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void answerCaseStep("Cancelar")}
                    disabled={sending}
                    className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción rápida en el pie */}
      {!showCaseForm && (
        <div className="border-t border-lime-100/70 bg-white/80 px-3 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={startOrderFlow}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1.5 font-bold text-orange-900 transition hover:bg-orange-100 active:scale-95"
            >
              <ShoppingBag size={13} className="text-orange-600" /> Pedir Domicilio
            </button>
            {ENABLE_PQRS_FLOW ? (
              <>
                <button
                  type="button"
                  onClick={() => openCaseForm("PETICION")}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 font-semibold text-emerald-900 transition hover:bg-emerald-100 active:scale-95"
                >
                  <CircleHelp size={13} /> Registrar PQRS
                </button>
                <button
                  type="button"
                  onClick={openStatusLookup}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                >
                  Consultar radicado
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={showAtencionGeneralPqrs}
                className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 font-semibold text-emerald-900 transition hover:bg-emerald-100 active:scale-95"
              >
                <Phone size={13} className="text-emerald-700" /> Atención / PQRS ({ATENCION_GENERAL_DISPLAY})
              </button>
            )}
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Cuáles son las direcciones de las sedes para abrir en Google Maps?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <MapPin size={13} className="text-orange-500" /> Sedes y Mapas
            </button>
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Cuáles son las promociones de la semana?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <Tag size={13} className="text-emerald-700" /> Promociones
            </button>
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Qué vacantes y ofertas de trabajo tienen disponibles?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <Briefcase size={13} className="text-emerald-700" /> Vacantes / Empleo
            </button>
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Qué servicios y cafeterías tiene Supermercados Betel?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <Sparkles size={13} className="text-amber-500" /> Servicios y Cafeterías
            </button>
            
          </div>
        </div>
      )}

      {/* Barra de llamada a la acción hacia el campo de texto cuando se requiere escribir */}
      {ENABLE_PQRS_FLOW && showCaseForm && isTypingStep && (
        <div className="flex items-center justify-between gap-2 border-t border-amber-200/90 bg-gradient-to-r from-amber-50 via-lime-50 to-amber-50 px-4 py-2 text-xs font-semibold text-amber-950">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black animate-bounce">
              ↓
            </span>
            <span>
              {caseStep === "name" && "Escribe tu nombre y apellido en el campo de texto aquí abajo 👇"}
              {caseStep === "phone" && "Escribe tu número de teléfono o celular en el campo de texto aquí abajo 👇"}
              {caseStep === "email" && "Escribe tu correo aquí abajo (o pulsa Omitir arriba) 👇"}
              {caseStep === "description" && "Escribe los detalles de tu caso en el campo de texto aquí abajo 👇"}
              {caseStep === "status-code" && "Escribe el código de radicado en el campo de texto aquí abajo 👇"}
            </span>
          </span>
          <span className="hidden sm:inline-block text-[10px] text-amber-800 font-bold">
            Enviar con ↵
          </span>
        </div>
      )}

      {/* Barra de entrada de texto */}
      <form
        onSubmit={(e) => void sendMessage(e)}
        className="relative flex shrink-0 items-center gap-2 border-t border-lime-200/60 bg-white p-3"
      >
        {/* Botón flotante para ocultar el teclado (visible cuando el input está enfocado en móvil) */}
        {isInputFocused && (
          <button
            type="button"
            onClick={dismissKeyboard}
            aria-label="Ocultar teclado"
            title="Ocultar teclado"
            className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 sm:hidden"
          >
            <ChevronDown size={18} />
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            setIsInputFocused(true);
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }, 120);
          }}
          onBlur={() => {
            // Breve delay por si se pulsa el botón de enviar
            setTimeout(() => setIsInputFocused(false), 200);
          }}
          disabled={sending}
          placeholder={getInputPlaceholder()}
          className={`flex-1 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm outline-none transition ${
            isTypingStep
              ? "border-emerald-500 bg-emerald-50/25 font-medium text-slate-900 ring-2 ring-emerald-500/30 placeholder:text-emerald-700/60"
              : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white"
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Enviar mensaje"
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 active:scale-95"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
