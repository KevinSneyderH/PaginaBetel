import { Sun, Recycle, HeartHandshake, Leaf, ShieldCheck, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

export function SocialResponsibilitySection() {
  const { sustainability } = COMPANY_DATA;

  return (
    <section id="sostenibilidad" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Leaf className="w-3.5 h-3.5" />
            Responsabilidad Social & Ambiental
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Cuidamos Nuestra Tierra y Nuestra Comunidad
          </h2>
          <p className="text-emerald-200/80 text-base sm:text-lg">
            En Supermercados Betel creemos que el crecimiento empresarial debe ir de la mano con la protección de nuestro entorno natural y el apoyo a las causas sociales.
          </p>
        </div>

        {/* 2 Big Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Pillar 1: Solar Panels */}
          <div className="bg-emerald-900/40 rounded-3xl p-8 border border-emerald-800/60 flex flex-col justify-between hover:bg-emerald-900/60 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <Sun className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-800/80 rounded-lg text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                {sustainability.solarEnergy.subtitle}
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                {sustainability.solarEnergy.title}
              </h3>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
                {sustainability.solarEnergy.description}
              </p>
            </div>

            <div className="pt-6 border-t border-emerald-800/60 flex items-center gap-3 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Energía limpia instalada en sedes de Cúcuta y el área metropolitana</span>
            </div>
          </div>

          {/* Pillar 2: Circular Economy */}
          <div className="bg-emerald-900/40 rounded-3xl p-8 border border-emerald-800/60 flex flex-col justify-between hover:bg-emerald-900/60 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Recycle className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-800/80 rounded-lg text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                {sustainability.circularEconomy.subtitle}
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                {sustainability.circularEconomy.title}
              </h3>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
                {sustainability.circularEconomy.description}
              </p>
            </div>

            <div className="pt-6 border-t border-emerald-800/60 flex items-center gap-3 text-xs font-semibold text-emerald-300">
              <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reciclaje con impacto directo en fundaciones locales</span>
            </div>
          </div>

        </div>

        {/* Feature Image Banner */}
        <div className="rounded-3xl overflow-hidden border border-emerald-800/70 shadow-2xl relative">
          <img
            src="/images/responsabilidad-social.jpg"
            alt="Supermercados Betel Responsabilidad Social"
            className="w-full aspect-[21/9] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/50 to-transparent flex items-center p-6 sm:p-12">
            <div className="max-w-xl">
              <h4 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Juntos construimos un futuro sostenible para Norte de Santander
              </h4>
              <p className="text-sm sm:text-base text-emerald-100 mb-6">
                Cada vez que compras en Betel, apoyas el desarrollo sostenible regional y las iniciativas sociales con las familias más vulnerables.
              </p>
              <a
                href="#sedes"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-100 transition-colors"
              >
                <span>Visita nuestras sedes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
