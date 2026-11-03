import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUp,
  Briefcase,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  ExternalLink,
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
  mapa_query?: string | null;
}

export type ChatIntent =
  | "select_order_store"
  | "order_store"
  | "store_info"
  | "stores_list"
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
  "initial-consent": { paso: 1, total: 8, label: "Autorización de datos" },
  type: { paso: 2, total: 8, label: "Tipo de solicitud" },
  name: { paso: 3, total: 8, label: "Nombre completo" },
  phone: { paso: 4, total: 8, label: "Teléfono de contacto" },
  email: { paso: 5, total: 8, label: "Correo electrónico" },
  store: { paso: 6, total: 8, label: "Sede relacionada" },
  description: { paso: 7, total: 8, label: "Detalle de lo ocurrido" },
  consent: { paso: 8, total: 8, label: "Confirmación de envío" },
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
      "¡Hola! Soy el asistente virtual de **Supermercados Betel** 🛒.\n\nPuedo ayudarte a:\n• 🚚 **Pedir un domicilio** eligiendo tu sede para ir a WhatsApp\n• 📍 **Ver direcciones** y abrir nuestras sedes en **Google Maps**\n• 🏷️ Consultar **promociones, cafeterías, servicios, sostenibilidad y vacantes**\n• 📞 Comunicarte con **Atención General Betel y PQRS (317 679 7058)**\n\n¿En qué te puedo colaborar hoy?",
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

    // Si estaba seleccionando sede de domicilio y escribe el nombre de una sede
    if (selectingOrderStore) {
      const norm = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const matched = sedesActions.find((s) => {
        const sNorm = s.nombre
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return norm.includes(sNorm) || (sNorm === "ceiba 2" && /\bceiba\b/.test(norm));
      });
      if (matched) {
        handleSelectOrderStore(matched);
        return;
      }
      setSelectingOrderStore(false);
    }

    setMessages((current) => [...current, newMessage("user", text)]);

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

      setMessages((current) => [
        ...current,
        newMessage("assistant", data.reply.trim(), {
          intent,
          stores: storesFromApi ?? (intent === "select_order_store" ? sedesActions : undefined),
          generalPhone: data.generalPhone || ATENCION_GENERAL_PHONE,
        }),
      ]);
    } catch {
      // Fallback local inteligente en caso de que no haya conexión momentánea
      const norm = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const matchedStore = sedesActions.find((s) =>
        norm.includes(s.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()),
      );

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
        "Te guiaré paso a paso para radicar tu caso. Antes de solicitar tus datos de contacto, necesitamos tu autorización para usarlos únicamente en la atención de tu solicitud. ¿Autorizas el tratamiento de tus datos? Responde Sí o No.",
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
        "Por favor escribe el código de seguimiento de tu solicitud (ejemplo: 8 a 16 caracteres alfanuméricos) para consultar su estado en tiempo real.",
      ),
    ]);
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

    if (caseStep === "initial-consent") {
      if (/\b(si|acepto|autorizo|de acuerdo|claro|por supuesto)\b/.test(normalized)) {
        setCaseStep("type");
        setMessages((current) => [
          ...current,
          newMessage("assistant", "¡Perfecto! Selecciona qué tipo de trámite deseas realizar:"),
        ]);
      } else {
        setShowCaseForm(false);
        setCaseStep(null);
        setMessages((current) => [
          ...current,
          newMessage(
            "assistant",
            "Entendido. Sin tu consentimiento no podemos almacenar datos personales para la PQRS. Si deseas continuar en otro momento, aquí estaré.",
          ),
        ]);
      }
      return;
    }

    if (caseStep === "type") {
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
        newMessage("assistant", `Trámite: ${elegido}. Por favor indícame tu nombre completo:`),
      ]);
      return;
    }

    if (caseStep === "name") {
      if (value.length < 2) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Por favor ingresa un nombre válido (mínimo 2 caracteres):"),
        ]);
        return;
      }
      setCaseData((prev) => ({ ...prev, nombre: value }));
      setCaseStep("phone");
      setMessages((current) => [
        ...current,
        newMessage("assistant", `Gracias, ${value}. Ahora escribe tu número de teléfono o celular de contacto:`),
      ]);
      return;
    }

    if (caseStep === "phone") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length < 7) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Por favor ingresa un número telefónico válido (mínimo 7 dígitos):"),
        ]);
        return;
      }
      setCaseData((prev) => ({ ...prev, telefono: soloNumeros }));
      setCaseStep("email");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "Ingresa tu correo electrónico para enviarte notificaciones del caso (o escribe 'Omitir' si prefieres no darlo):",
        ),
      ]);
      return;
    }

    if (caseStep === "email") {
      const omitir = /\b(omitir|no|ninguno|saltar|pasar)\b/.test(normalized);
      if (!omitir && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "El correo ingresado no es válido. Escribe un correo correcto o escribe 'Omitir':"),
        ]);
        return;
      }
      setCaseData((prev) => ({ ...prev, correo: omitir ? "" : value }));
      setCaseStep("store");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "¿Con cuál sede o tienda de Supermercados Betel está relacionada tu solicitud? Puedes pulsar una de las sedes a continuación o escribir 'Omitir':",
        ),
      ]);
      return;
    }

    if (caseStep === "store") {
      const omitir = /\b(omitir|ninguna|no se|general)\b/.test(normalized);
      const tienda = omitir ? "General / No especificada" : value;
      setCaseData((prev) => ({ ...prev, tienda }));
      setCaseStep("description");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `Sede: ${tienda}.\nAhora detalla brevemente lo ocurrido o el motivo de tu solicitud (mínimo 10 caracteres):`,
        ),
      ]);
      return;
    }

    if (caseStep === "description") {
      if (value.length < 10) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "Por favor describe tu caso con un poco más de detalle (mínimo 10 caracteres):"),
        ]);
        return;
      }
      const dataFinal = { ...caseData, descripcion: value };
      setCaseData(dataFinal);
      setCaseStep("consent");
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          `📋 Resumen de tu solicitud:\n• Tipo: ${caseType}\n• Nombre: ${dataFinal.nombre}\n• Teléfono: ${dataFinal.telefono}\n• Correo: ${dataFinal.correo || "No indicado"}\n• Sede: ${dataFinal.tienda}\n• Detalle: "${dataFinal.descripcion}"\n\n¿Deseas radicar formalmente esta solicitud ahora? Responde Sí para confirmar o Cancelar.`,
        ),
      ]);
      return;
    }

    if (caseStep === "consent") {
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
              `🎉 ¡Tu solicitud ha sido radicada con éxito!\n\nTu código de seguimiento oficial es:`,
              { isRadicado: true, radicadoCodigo: codigo },
            ),
            newMessage(
              "assistant",
              "Guarda este código para consultar el avance en cualquier momento escribiendo aquí 'Consultar radicado'. Nuestro equipo de atención al cliente lo revisará a la brevedad.",
            ),
          ]);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Error al registrar la solicitud.";
          setMessages((current) => [
            ...current,
            newMessage("assistant", `Hubo un inconveniente al radicar la solicitud: ${errorMsg}. Por favor intenta de nuevo.`),
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
      const codigo = value.replace(/[\s-]/g, "").toUpperCase();
      if (!/^[A-F0-9]{8,16}$/.test(codigo)) {
        setMessages((current) => [
          ...current,
          newMessage("assistant", "El código ingresado no tiene un formato válido. Debe contener entre 8 y 16 letras y números. Intenta de nuevo:"),
        ]);
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
            newMessage("assistant", "No encontré una solicitud con ese código en el sistema. Verifica que esté bien escrito e inténtalo de nuevo."),
          ]);
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
            newMessage("assistant", `📋 Solicitud ${data.codigo}:\nEstado: ${estado}${respuesta}`),
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border border-lime-200/80 bg-[#fffdf8] shadow-2xl">
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
                      href="#trabaja-con-nosotros"
                      onClick={() => {
                        if (isWidget && onClose) onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition"
                    >
                      <Briefcase size={13} className="text-orange-500" /> Ver Vacantes en la Web
                    </a>
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
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selecciona una opción:
            </p>

            {caseStep === "type" && (
              <div className="flex flex-wrap gap-1.5">
                {(["Petición", "Queja", "Reclamo", "Sugerencia", "Asesor"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => void answerCaseStep(tipo)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 active:scale-95"
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}

            {caseStep === "store" && (
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
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Omitir sede
                </button>
              </div>
            )}

            {(caseStep === "initial-consent" || caseStep === "consent") && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void answerCaseStep("Sí")}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
                >
                  Sí, autorizo
                </button>
                <button
                  type="button"
                  onClick={() => void answerCaseStep("No")}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  No autorizo
                </button>
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
              onClick={() => void sendMessage(undefined, "¿Qué servicios, cafeterías y vacantes tiene Supermercados Betel?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <Sparkles size={13} className="text-amber-500" /> Servicios y Cafeterías
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
          </div>
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
          placeholder={
            showCaseForm
              ? "Escribe tu respuesta aquí…"
              : selectingOrderStore
                ? "Elige una sede arriba o escríbela…"
                : "Pregunta por domicilios, sedes, promociones, cafeterías…"
          }
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
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
