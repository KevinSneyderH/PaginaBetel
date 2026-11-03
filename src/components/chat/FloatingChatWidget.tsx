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

  // Escucha visualViewport para adaptar la altura en tiempo real cuando el teclado móvil sube/baja
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      if (window.innerWidth < 640 && window.visualViewport) {
        setMobileViewportHeight(window.visualViewport.height);
      } else {
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

  // Bloquear el scroll de fondo en móvil o cuando está expandido para evitar desplazamientos accidentales
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    if (window.innerWidth < 640 || isExpanded) {
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
              height:
                mobileViewportHeight && !isExpanded
                  ? `${mobileViewportHeight}px`
                  : undefined,
            }}
            className={
              isExpanded
                ? "fixed inset-2 sm:inset-8 z-50 mx-auto my-auto w-[min(820px,calc(100vw-16px))] sm:w-[min(820px,calc(100vw-32px))] h-[min(720px,calc(100dvh-32px))] sm:h-[min(720px,calc(100dvh-64px))] animate-in zoom-in-95 duration-200"
                : "fixed inset-x-0 bottom-0 top-0 sm:top-auto sm:inset-x-auto sm:bottom-24 sm:right-6 z-50 w-full sm:w-[430px] h-[100dvh] sm:h-[min(580px,calc(100dvh-130px))] animate-in zoom-in-95 fade-in duration-200"
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
