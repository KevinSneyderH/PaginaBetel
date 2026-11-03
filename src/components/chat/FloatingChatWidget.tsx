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
  const [mobileViewportHeight, setMobileViewportHeight] = useState<number | null>(null);

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Escucha visualViewport para detectar exactamente cuánto empuja el teclado virtual hacia arriba
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      if (window.innerWidth < 640 && window.visualViewport) {
        // En móviles, la diferencia entre window.innerHeight y visualViewport.height indica el teclado
        const diff = window.innerHeight - window.visualViewport.height;
        const offset = Math.max(0, diff - (window.visualViewport.offsetTop || 0));
        setKeyboardOffset(offset);
        setMobileViewportHeight(window.visualViewport.height);
      } else {
        setKeyboardOffset(0);
        setMobileViewportHeight(null);
      }
    };

    handleViewportChange();
    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  // Bloquear el scroll de fondo solo cuando está expandido para permitir una experiencia natural
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          setIsOpen(false);
        }
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
              className="fixed inset-0 z-[45] bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsExpanded(false)}
            />
          )}

          <aside
            role="complementary"
            aria-label="Ventana de ayuda y atención Betel"
            style={{
              bottom: keyboardOffset > 0 ? `${keyboardOffset + 10}px` : undefined,
              maxHeight:
                keyboardOffset > 0 && mobileViewportHeight
                  ? `${mobileViewportHeight - 16}px`
                  : undefined,
            }}
            className={
              isExpanded
                ? "fixed inset-2 sm:inset-8 z-50 mx-auto my-auto w-[calc(100vw-16px)] sm:w-[min(820px,calc(100vw-32px))] h-[calc(100dvh-16px)] sm:h-[min(720px,calc(100dvh-64px))] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
                : "fixed inset-x-3 bottom-24 sm:inset-x-auto sm:bottom-24 sm:right-6 z-50 w-auto sm:w-[430px] h-[min(540px,calc(100dvh-120px))] rounded-3xl shadow-2xl transition-[bottom] duration-150 ease-out animate-in zoom-in-95 fade-in border border-emerald-900/10"
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
              onOpenWhatsApp={() => {
                setIsOpen(false);
                setIsExpanded(false);
                onOpenWhatsApp?.();
              }}
            />
          </aside>
        </>
      )}

      {/* Botón flotante estilo Betel en la esquina inferior derecha */}
      <div
        className={`fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-30 items-center group ${
          isOpen ? "hidden sm:flex" : "flex"
        }`}
      >
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
          className="relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-hidden"
        >
          {isOpen ? (
            <div className="animate-betel-pop flex size-[72px] sm:size-[72px] items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/50 hover:bg-slate-800 transition-colors">
              <X className="size-8 text-white" />
            </div>
          ) : (
            <div className="animate-betel-pop relative flex size-20 sm:size-[84px] items-center justify-center">
              {/* Anillo con animación de pulso sutil */}
              <span className="absolute inset-2 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />

              {/* Movimiento orgánico flotante cuando está en espera de acción */}
              <div className="animate-betel-waiting size-full flex items-center justify-center">
                <img
                  src={assetPath("/whatsapp_betel.png")}
                  onError={(e) => {
                    e.currentTarget.src = assetPath("/wa.svg");
                  }}
                  alt="WhatsApp Betel"
                  className="size-full object-contain drop-shadow-xl select-none pointer-events-none"
                />
              </div>
            </div>
          )}
        </button>
      </div>
    </>
  );
}

export default FloatingChatWidget;
