import { assetPath } from '../utils/assetPath';

interface FloatingWhatsAppButtonProps {
  onClick: () => void;
}

export function FloatingWhatsAppButton({ onClick }: FloatingWhatsAppButtonProps) {
  return (
    <div className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden sm:block mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        ¡Pide a domicilio o chatea con tu sede!
      </div>

      <button
        type="button"
        onClick={onClick}
        aria-label="Abrir chat de WhatsApp"
        className="relative flex items-center justify-center size-[72px] sm:size-[72px] transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-hidden"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-1.5 rounded-full bg-emerald-400/40 animate-ping pointer-events-none"></span>

        <img
          src={assetPath("/whatsapp_betel.png")}
          onError={(e) => {
            e.currentTarget.src = assetPath("/wa.svg");
          }}
          alt="WhatsApp Betel"
          className="size-full object-contain drop-shadow-xl select-none pointer-events-none"
        />
      </button>
    </div>
  );
}
