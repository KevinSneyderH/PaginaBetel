import { useState, useEffect } from 'react';
import { Tag, Sparkles, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { PROMOS_DATA, type PromoDay } from '../data/promosData';

interface PromotionsSectionProps {
  onOpenWhatsApp: () => void;
}

export function PromotionsSection({ onOpenWhatsApp }: PromotionsSectionProps) {
  // Determine current day of week to auto-select
  const [selectedDayId, setSelectedDayId] = useState<string>('lunes');

  useEffect(() => {
    const day = new Date().getDay();
    const mapDay: { [key: number]: string } = {
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
    };
    if (mapDay[day]) {
      setSelectedDayId(mapDay[day]);
    }
  }, []);

  const activePromo: PromoDay =
    PROMOS_DATA.find((p) => p.id === selectedDayId) || PROMOS_DATA[0];

  return (
    <section id="promociones" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Tag className="w-3.5 h-3.5 text-orange-600" />
            Ahorro Diario Garantizado
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Promociones Especiales Todos los Días
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            En Supermercados Betel premiamos tu fidelidad cada día de la semana con ofertas exclusivas en frutas, verduras, carnicería, aseo y despensa familiar.
          </p>
        </div>

        {/* Days Selector Tabs */}
        <div className="mb-10 w-full">
          <div className="grid w-full max-w-3xl grid-cols-5 mx-auto p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1.5">
            {PROMOS_DATA.map((promo) => {
              const isSelected = promo.id === selectedDayId;
              return (
                <button
                  key={promo.id}
                  onClick={() => setSelectedDayId(promo.id)}
                  className={`min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 scale-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="sm:hidden">{promo.shortDay}</span>
                  <span className="hidden sm:inline">{promo.dayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Promotion Showcase Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Promo Text Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Oferta de cada {activePromo.dayName}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                {activePromo.title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activePromo.description}
              </p>

              {/* Highlights Checklist with Lime Icons */}
              <div className="space-y-3 pt-2">
                {activePromo.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <button
                  onClick={onOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedir Ofertas de {activePromo.dayName}</span>
                </button>
                <a
                  href="#sedes"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <span>Ver sedes participantes</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Promo Flyer Banner */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-sm sm:max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/60 group">
                <img
                  src={`${activePromo.banner}?v=${new Date().toISOString().slice(0, 10)}`}
                  alt={`Promoción ${activePromo.dayName} Supermercados Betel`}
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-lg backdrop-blur-sm shadow-md">
                  {activePromo.badge}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
