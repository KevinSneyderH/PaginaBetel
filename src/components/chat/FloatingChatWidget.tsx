import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { assetPath } from "../../utils/assetPath";
import BetelChatBox from "./BetelChatBox";

interface FloatingChatWidgetProps {
  onOpenWhatsApp?: () => void;
}

export function FloatingChatWidget({ onOpenWhatsApp }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen || !isExpanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isExpanded]);

  return (
    <>
      {/* Modal / Popover del Chatbot */}
      {isOpen && (
        <>
          {/* Fondo oscuro si está expandido a pantalla completa */}
          {isExpanded && (
            <div
              className="fixed inset-0 z-[75] bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsExpanded(false)}
            />
          )}

          <aside
            role="complementary"
            aria-label="Ventana de ayuda y atención Betel"
            className={
              isExpanded
                ? "fixed inset-4 sm:inset-8 z-[80] mx-auto my-auto w-[min(820px,calc(100vw-32px))] h-[min(720px,calc(100dvh-64px))] animate-in zoom-in-95 duration-200"
                : "fixed bottom-[160px] sm:bottom-24 right-4 sm:right-6 left-4 sm:left-auto z-[80] sm:w-[430px] h-[min(560px,calc(100dvh-180px))] animate-in zoom-in-95 fade-in duration-200"
            }
          >
            <BetelChatBox
              isWidget
              isExpanded={isExpanded}
              onClose={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              onToggleExpand={() => setIsExpanded((prev) => !prev)}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          </aside>
        </>
      )}

      {/* Botón flotante estilo Betel en la esquina inferior derecha */}
      <div className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-[70] flex items-center group">
        {/* Tooltip informativo al pasar el cursor */}
        {!isOpen && (
          <div className="hidden sm:block mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-slate-800">
            ¿Dudas o pedidos? Chatea con el Asistente Betel
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (isOpen) setIsExpanded(false);
          }}
          aria-label={isOpen ? "Cerrar chat de ayuda Betel" : "Abrir chat de ayuda Betel"}
          title={isOpen ? "Cerrar chat" : "Chatear con el Asistente Betel"}
          className={`relative flex items-center justify-center size-14 rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/40 rotate-90"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40 hover:scale-110"
          }`}
        >
          {/* Anillo con animación de pulso */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X className="size-6 text-white" />
          ) : (
            <img
              src={assetPath("/chatbot-avatar.png")}
              alt="Asistente Betel"
              className="size-10 object-contain drop-shadow select-none pointer-events-none"
            />
          )}

          {/* Insignia de notificación */}
          {!isOpen && (
            <span className="absolute top-0 right-0 size-3.5 bg-orange-500 border-2 border-white rounded-full" />
          )}
        </button>
      </div>
    </>
  );
}
export default FloatingChatWidget;

