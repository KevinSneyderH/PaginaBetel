import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  onClick: () => void;
}

export function FloatingWhatsAppButton({ onClick }: FloatingWhatsAppButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden sm:block mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        ¡Pide a domicilio o chatea con tu sede!
      </div>

      <button
        onClick={onClick}
        aria-label="Abrir chat de WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none"></span>

        <MessageCircle className="w-7 h-7 relative z-10" />

        {/* Small notification badge */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
}
