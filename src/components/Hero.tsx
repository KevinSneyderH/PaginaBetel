import { MapPin, ShoppingBag, Clock, Sparkles, Coffee, ShieldCheck, Sun } from 'lucide-react';

interface HeroProps {
  onOpenWhatsApp: () => void;
}

export function Hero({ onOpenWhatsApp }: HeroProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-lime-50/50 via-white to-orange-50/30 pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background blur decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-lime-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-300/80 text-lime-900 text-xs sm:text-sm font-bold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>34 Años al Servicio de Norte de Santander</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none mb-6">
              Calidad, frescura y economía{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 via-emerald-600 to-orange-500">
                siempre más cerca de ti
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Somos tu cadena de supermercados de confianza en Cúcuta y Norte de Santander. Conoce nuestras <strong>10 sedes</strong> estratégicas, servicio nocturno 24 horas por ventanilla, cafeterías con panadería fresca y domicilios rápidos a tu casa.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href="#sedes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-lime-600 hover:bg-lime-700 text-white font-black rounded-2xl shadow-lg shadow-lime-600/30 hover:shadow-lime-600/50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <MapPin className="w-5 h-5 text-white" />
                <span>Ver Nuestras 10 Sedes</span>
              </a>

              <button
                onClick={onOpenWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Pedir Domicilio</span>
              </button>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold">
                <div className="p-1.5 rounded-lg bg-lime-100 text-lime-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>10 Sedes activas</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold">
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Ventanilla 24H</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                  <Coffee className="w-4 h-4" />
                </div>
                <span>Cafeterías Betel</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                  <Sun className="w-4 h-4" />
                </div>
                <span>Energía Solar</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card with Official Assets */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src="/images/banner-nosotros.jpg"
                  alt="Supermercados Betel Equipo y Sedes"
                  className="w-full aspect-video object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

                {/* Overlaid Card Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-xs font-black uppercase tracking-wider mb-2 shadow-md">
                    Tradición & Confianza
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    ¡Crecemos contigo en Norte de Santander!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2">
                    Distribuidores líderes de la canasta familiar con calidad insuperable y los mejores precios del mercado.
                  </p>
                </div>
              </div>

              {/* Floating Stat Badge 1 */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl shadow-xl p-3.5 border border-slate-100 flex items-center gap-3 animate-bounce [animation-duration:4s]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-lime-500/30">
                  34
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Años de Historia</div>
                  <div className="text-[11px] text-slate-500 font-medium">Fundación Familiar</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white rounded-2xl shadow-xl p-3.5 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Garantía de Calidad</div>
                  <div className="text-[11px] text-lime-700 font-bold">100% Frescura Diaria</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
