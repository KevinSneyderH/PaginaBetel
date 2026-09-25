import { Coffee, Croissant, UtensilsCrossed, Clock, MapPin, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

interface CafeteriaSectionProps {
  onOpenWhatsApp: () => void;
}

export function CafeteriaSection({ onOpenWhatsApp }: CafeteriaSectionProps) {
  const { cafeteria } = COMPANY_DATA;

  return (
    <section id="cafeterias" className="py-20 bg-amber-50/50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            Punto de Encuentro y Descanso
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            {cafeteria.title}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {cafeteria.description}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Café Seleccionado</h4>
              <p className="text-xs text-slate-600">Café de origen colombiano recién colado para comenzar tu jornada con la mejor energía.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Croissant className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Panadería Caliente</h4>
              <p className="text-xs text-slate-600">Pan fresco, pasteles de pollo, empanadas y delicias horneadas continuamente durante el día.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Desayunos & Combos</h4>
              <p className="text-xs text-slate-600">Desayunos completos, jugos 100% naturales y comidas rápidas preparadas al momento.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Ambiente Agradable</h4>
              <p className="text-xs text-slate-600">Espacios limpios y confortables diseñados para disfrutar con tu familia o amigos.</p>
            </div>
          </div>
        </div>

        {/* Cafeteria Branches List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                Sedes Betel con Servicio de Cafetería
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Disfruta de nuestros productos en cualquiera de estos 5 puntos
              </p>
            </div>
            <button
              onClick={onOpenWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              Consultar Menú por WhatsApp
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cafeteria.branches.map((b, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-100/50 border border-amber-200/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-slate-900 text-base">{b.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Abierta hoy
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{b.hours}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/40 text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <span>Tel: {b.phone}</span>
                  <a
                    href={`https://wa.me/57${b.phone}?text=${encodeURIComponent(`Hola Betel ${b.name}, me gustaría consultar el menú de la cafetería.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                  >
                    Escribir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
