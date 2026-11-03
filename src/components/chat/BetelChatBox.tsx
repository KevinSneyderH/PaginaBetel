import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  Check,
  CircleHelp,
  Copy,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { assetPath } from "../../utils/assetPath";
import { useSedes } from "../../utils/sedesApi";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
  isRadicado?: boolean;
  radicadoCodigo?: string;
  showOrderCta?: boolean;
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
  extra?: { isRadicado?: boolean; radicadoCodigo?: string; showOrderCta?: boolean },
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

interface BetelChatBoxProps {
  isWidget?: boolean;
  isExpanded?: boolean;
  onClose?: () => void;
  onToggleExpand?: () => void;
  onOpenWhatsApp?: () => void;
}

export default function BetelChatBox({
  isWidget = false,
  isExpanded = false,
  onClose,
  onToggleExpand,
  onOpenWhatsApp,
}: BetelChatBoxProps) {
  const { sedes } = useSedes();
  const [messages, setMessages] = useState<ChatMessage[]>([
    newMessage(
      "assistant",
      "¡Hola! Soy el asistente virtual de Supermercados Betel. Te puedo orientar con pedidos a domicilio, teléfonos, ubicación de nuestras sedes, horarios, o radicar una PQRS oficial. ¿En qué te puedo colaborar?",
    ),
  ]);
  const [input, setInput] = useState("");
  const [session] = useState(createUuid);
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Flujo PQRS guiado
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, showCaseForm]);

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
    setCaseData({ nombre: "", telefono: "", correo: "", tienda: "", descripcion: "" });
    setMessages([
      newMessage(
        "assistant",
        "Conversación reiniciada. ¿En qué más puedo orientarte hoy? Puedes preguntar por pedidos, sedes o radicar una PQRS.",
      ),
    ]);
  };

  const sendMessage = async (event?: FormEvent<HTMLFormElement>, textOverride?: string) => {
    if (event) event.preventDefault();
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setInput("");
    setMessages((current) => [...current, newMessage("user", text)]);

    // Si está en flujo interactivo paso a paso de PQRS
    if (showCaseForm && caseStep) {
      await answerCaseStep(text);
      return;
    }

    // Si pregunta por consultar radicado en texto libre
    if (isStatusLookupRequest(text)) {
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

      const isOrderRelated = /\b(pedido|pedidos|domicilio|domicilios|whatsapp)\b/i.test(text);
      setMessages((current) => [
        ...current,
        newMessage("assistant", data.reply.trim(), { showOrderCta: isOrderRelated && Boolean(onOpenWhatsApp) }),
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "No pude conectarme con el servicio en este instante. Si deseas hacer un pedido, puedes comunicarte al WhatsApp de tu sede o radicar una PQRS con los botones rápidos.",
        ),
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const openCaseForm = (type: TipoCaso) => {
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
          newMessage(
            "assistant",
            "¡Perfecto! Selecciona qué tipo de trámite deseas realizar:",
          ),
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
        newMessage(
          "assistant",
          `Trámite: ${elegido}. Por favor indícame tu nombre completo:`,
        ),
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
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-lime-200/80 bg-[#fffdf8] shadow-2xl">
      {/* Encabezado Verde Bosque Institucional */}
      <header className="relative flex shrink-0 items-center justify-between border-b border-lime-500/20 bg-gradient-to-r from-emerald-950 via-[#12351d] to-[#092b17] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl border border-lime-400/30 bg-white/10 p-1 backdrop-blur-md">
            <img
              src={assetPath("/logo.png")}
              alt="Supermercados Betel"
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
                Oficial
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-200/80">
              Pedidos, Sedes, PQRS y Atención
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botón de reiniciar chat */}
          <button
            type="button"
            onClick={resetChat}
            title="Reiniciar conversación"
            aria-label="Reiniciar conversación"
            className="flex size-8 items-center justify-center rounded-xl text-emerald-200 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={15} />
          </button>

          {/* Botón para expandir / contraer */}
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

          {/* Botón cerrar si es widget */}
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

      {/* Barra de progreso interactiva si está en radicación PQRS */}
      {showCaseForm && caseStep && STEP_LABELS[caseStep] && (
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
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 overscroll-contain">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold">
                  B
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "rounded-br-xs bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-medium"
                    : "rounded-bl-xs border border-slate-200/70 bg-white text-slate-800"
                }`}
              >
                <div className="whitespace-pre-line break-words">{message.text}</div>

                {/* Botón rápido para abrir WhatsApp si pregunta por pedidos */}
                {message.showOrderCta && onOpenWhatsApp && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onOpenWhatsApp}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition active:scale-95"
                    >
                      <ShoppingBag size={14} /> Abrir lista de sedes y pedidos
                    </button>
                  </div>
                )}

                {/* Tarjeta de Radicado Oficial */}
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

        {/* Chips de respuestas rápidas durante el flujo de caso */}
        {showCaseForm && caseStep && (
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selecciona una opción:
            </p>

            {/* Tipo de caso */}
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

            {/* Selector de Tienda / Sede dinámico */}
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

            {/* Autorización / Confirmación */}
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
        <div className="border-t border-lime-100/70 bg-white/70 px-3 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 font-bold text-orange-900 transition hover:bg-orange-100 active:scale-95"
              >
                <ShoppingBag size={13} className="text-orange-600" /> Pedir a Domicilio
              </button>
            )}
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Cuáles son los teléfonos y sedes de Betel?")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              <Phone size={13} className="text-emerald-700" /> Teléfonos & Sedes
            </button>
            <button
              type="button"
              onClick={() => void sendMessage(undefined, "¿Cuáles son los horarios de atención?")}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
            >
              Horarios & 24H
            </button>
            <button
              type="button"
              onClick={openStatusLookup}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-900 transition hover:bg-emerald-100 active:scale-95"
            >
              <CircleHelp size={13} className="text-emerald-700" /> Consultar Radicado
            </button>
            <button
              type="button"
              onClick={() => openCaseForm("PETICION")}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-900 transition hover:bg-emerald-100 active:scale-95"
            >
              Radicar PQRS
            </button>
          </div>
        </div>
      )}

      {/* Input de texto y envío */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            showCaseForm && caseStep
              ? "Escribe tu respuesta aquí…"
              : "Pregúntame sobre pedidos, sedes, horarios o PQRS…"
          }
          className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Enviar mensaje"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-40 active:scale-95 cursor-pointer"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
