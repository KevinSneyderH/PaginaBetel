import { useState } from 'react';
import { MessageCircle, X, Search, Send, MapPin, Sparkles } from 'lucide-react';
import { SEDES_DATA, type Sede } from '../data/sedesData';
import { COMPANY_DATA } from '../data/companyData';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSede?: Sede | null;
}

export function WhatsAppModal({ isOpen, onClose, initialSede }: WhatsAppModalProps) {
  const [selectedSede, setSelectedSede] = useState<Sede | null>(initialSede || null);
  const [customMessage, setCustomMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredSedes = SEDES_DATA.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSede = selectedSede || initialSede;

  const handleSend = (phone: string, sedeName?: string) => {
    const text = customMessage.trim()
      ? customMessage.trim()
      : sedeName
      ? `¡Hola Supermercado Betel ${sedeName}! Me gustaría hacer un pedido o solicitar información.`
      : COMPANY_DATA.whatsappMessage;

    const url = `https://wa.me/57${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Chat de WhatsApp Betel</h3>
              <p className="text-xs text-emerald-100">Atención rápida para pedidos y consultas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* General Line Quick CTA */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Línea Central
              </div>
              <div className="text-sm font-bold text-slate-800">Atención General Betel</div>
              <div className="text-xs text-slate-500">Tel: {COMPANY_DATA.generalPhone}</div>
            </div>
            <button
              onClick={() => handleSend(COMPANY_DATA.generalPhone)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Chatear
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
            O selecciona tu sede más cercana:
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar sede (ej. Prados, Boconó, Patios...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sedes List */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {filteredSedes.map((sede) => (
              <button
                key={sede.id}
                onClick={() => setSelectedSede(sede)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                  activeSede?.id === sede.id
                    ? 'border-emerald-500 bg-emerald-50/70 text-slate-900 font-bold'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{sede.name}</span>
                    <span className="text-[10px] text-slate-400">({sede.city})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sede.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-emerald-700">{sede.phone}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mensaje personalizado (opcional):
            </label>
            <textarea
              rows={2}
              placeholder={
                activeSede
                  ? `Hola Betel ${activeSede.name}, quisiera pedir a domicilio...`
                  : 'Escribe tu consulta aquí...'
              }
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
            />
          </div>

        </div>

        {/* Footer / Send */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {activeSede ? (
              <span>Sede elegida: <strong className="text-slate-800">{activeSede.name}</strong></span>
            ) : (
              <span>Línea Central Betel</span>
            )}
          </div>
          <button
            onClick={() =>
              activeSede
                ? handleSend(activeSede.phone, activeSede.name)
                : handleSend(COMPANY_DATA.generalPhone)
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Iniciar Chat</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
