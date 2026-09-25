import { useState } from 'react';
import { Building2, Target, Eye, TrendingUp, HeartHandshake, Award, ShieldCheck, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

export function AboutSection() {
  const [activeTab, setActiveTab] = useState<'mision' | 'vision'>('mision');

  const valueIcons: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="w-5 h-5 text-orange-500" />,
    HeartHandshake: <HeartHandshake className="w-5 h-5 text-lime-600" />,
    Award: <Award className="w-5 h-5 text-amber-500" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    Users: <Users className="w-5 h-5 text-orange-600" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5 text-lime-600" />,
  };

  return (
    <section id="nosotros" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-200 text-lime-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-lime-700" />
            Nuestra Historia & Compromiso
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            34 Años Creciendo Junto a las Familias de Nuestra Región
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Somos una empresa Nortesantandereana, de origen familiar, fundada con la misión de servir y brindar la más cálida atención basada en el respeto, la excelencia y la cercanía con cada persona.
          </p>
        </div>

        {/* Mission & Vision Tabs Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Interactive Switcher */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab('mision')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'mision'
                      ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-md shadow-lime-600/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Nuestra Misión</span>
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'vision'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Nuestra Visión</span>
                </button>
              </div>

              <div className="min-h-[140px] flex items-center">
                {activeTab === 'mision' ? (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Target className="w-6 h-6 text-lime-600" />
                      Misión Institucional
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {COMPANY_DATA.mission}
                    </p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-orange-500" />
                      Visión Hacia el Futuro
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {COMPANY_DATA.vision}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
                <div className="p-3 rounded-2xl bg-lime-50/70 border border-lime-200">
                  <div className="text-2xl font-black text-lime-700">34+</div>
                  <div className="text-[11px] font-semibold text-slate-600">Años de Servicio</div>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <div className="text-2xl font-black text-orange-600">10</div>
                  <div className="text-[11px] font-semibold text-slate-600">Sedes en la Región</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-2xl font-black text-amber-600">100%</div>
                  <div className="text-[11px] font-semibold text-slate-600">Orgullo Regional</div>
                </div>
              </div>
            </div>

            {/* Right Column: Corporate Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100">
                <img
                  src="/images/banner-nosotros.jpg"
                  alt="Equipo Supermercados Betel"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Equipo Humano Capacitado
                    </div>
                    <div className="text-lg font-bold">Generando gratas experiencias de compra todos los días</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Corporate Values */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 text-center mb-8">
            Nuestros Valores Corporativos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPANY_DATA.values.map((val, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    {valueIcons[val.icon] || <CheckCircle2 className="w-5 h-5 text-lime-600" />}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{val.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
