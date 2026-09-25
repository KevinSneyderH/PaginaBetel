import { useState } from 'react';
import { ShoppingBag, Award, Droplets, Moon, Phone, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onOpenWhatsApp: () => void;
}

export function ServicesSection({ onOpenWhatsApp }: ServicesSectionProps) {
  const [activeTab, setActiveTab] = useState<'domicilios' | 'puntos' | 'botellon' | 'nocturno'>('domicilios');

  const services = [
    {
      id: 'domicilios' as const,
      name: 'Domicilios Betel',
      icon: <ShoppingBag className="w-4 h-4" />,
      tag: 'Tarifas desde $3.000',
      banner: '/images/domicilios.png',
      alt: 'Tarifas y servicio de Domicilios Betel',
      summary: 'Recibe tus compras en la puerta de tu hogar de 7:00 a.m. a 7:00 p.m. Servicio rápido, seguro y confiable.',
      highlights: [
        'Menos de $30.000: Domicilio a $5.000',
        'Entre $30.000 y $99.900: Domicilio a $4.000',
        'Más de $100.000: Domicilio a solo $3.000',
        'Línea exclusiva WhatsApp: 317 679 7058'
      ],
      actionText: 'Pedir Domicilio por WhatsApp',
      actionPhone: '3176797058'
    },
    {
      id: 'puntos' as const,
      name: 'Gana Puntos Betel',
      icon: <Award className="w-4 h-4" />,
      tag: 'Acumula 0,3%',
      banner: '/images/puntos.png',
      alt: 'Programa de fidelización Gana Puntos Supermercados Betel',
      summary: '¡Por tus compras gana puntos! Más compras, más ganas. Únete gratis en cualquiera de nuestras 10 sedes.',
      highlights: [
        'Acumula el 0,3% del valor total comprado',
        'Participa en todos los sorteos, premios y sorpresas',
        'El día de tu cumpleaños: ¡Tus puntos son dobles!',
        'Recibe antes que nadie ofertas y promociones exclusivas'
      ],
      actionText: 'Consultar Puntos Betel',
      actionPhone: '3154937743'
    },
    {
      id: 'botellon' as const,
      name: 'Agua La Huerta (Botellón)',
      icon: <Droplets className="w-4 h-4" />,
      tag: '$8.900 la recarga',
      banner: '/images/botellon.png',
      alt: 'Recarga de Botellón de Agua La Huerta en Betel',
      summary: '100% Pura. Refresca tu vida con agua potable tratada y de máxima pureza para toda tu familia.',
      highlights: [
        'Recarga de botellón a solo $8.900',
        'Agua 100% potable tratada con los más altos estándares',
        'Calidad y pureza garantizada',
        'Disponible en todas nuestras 10 sedes'
      ],
      actionText: 'Pedir Botellón a Domicilio',
      actionPhone: '3176797058'
    },
    {
      id: 'nocturno' as const,
      name: 'Servicio 24H & Ventanilla',
      icon: <Moon className="w-4 h-4" />,
      tag: 'Atención Continua',
      banner: '/images/sedes/PRADOS-DEL-ESTE.webp',
      alt: 'Sedes con ventanilla nocturna y servicio 24 horas',
      summary: 'Pensando en tus emergencias y necesidades a deshoras, contamos con sedes abiertas 24 horas y atención por ventanilla nocturna.',
      highlights: [
        'Sede Prados del Este: Puertas abiertas 24 horas continuo',
        'Sedes con Ventanilla Nocturna: Floresta, Boconó, San Rafael, El Contento, Chapinero, Los Patios',
        'Chinácota: Ventanilla activa fines de semana (Vie, Sáb, Dom)',
        'Seguridad, rapidez y los mismos precios'
      ],
      actionText: 'Ver Sedes 24 Horas',
      actionLink: '#sedes'
    }
  ];

  const currentService = services.find((s) => s.id === activeTab) || services[0];

  return (
    <section id="servicios" className="py-20 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-200 text-lime-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-lime-700" />
            Servicios & Beneficios Exclusivos
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Mucho más que un supermercado para tu familia
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Descubre los programas y servicios oficiales que tenemos preparados para ti en Norte de Santander.
          </p>
        </div>

        {/* Interactive Selector Tabs */}
        <div className="mb-10 w-full">
          <div className="grid w-full grid-cols-2 lg:grid-cols-4 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm gap-1.5">
            {services.map((s) => {
              const isSelected = s.id === activeTab;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`min-w-0 flex items-center justify-center gap-2 px-2 sm:px-3 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-md shadow-lime-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {s.icon}
                  <span className="min-w-0">{s.name}</span>
                  <span
                    className={`hidden xl:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-width Uncropped Banner Showcase */}
        <div className="min-w-0 bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-200/90 transition-all">
          <div className="space-y-6">
            
            {/* Banner Container: Natural Aspect Ratio without any cropping */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 group">
              <img
                src={currentService.banner}
                alt={currentService.alt}
                className="w-full h-auto max-h-[500px] object-contain mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
              />
            </div>

            {/* Banner Information & Action Bar */}
            <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                    {currentService.tag}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Información oficial Supermercados Betel</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {currentService.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {currentService.summary}
                </p>

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {currentService.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {currentService.actionPhone ? (
                  <a
                    href={`https://wa.me/57${currentService.actionPhone}?text=${encodeURIComponent(
                      `Hola Supermercados Betel, quiero información sobre: ${currentService.name}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5 text-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{currentService.actionText}</span>
                  </a>
                ) : (
                  <a
                    href={currentService.actionLink}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 text-sm cursor-pointer"
                  >
                    <span>{currentService.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={onOpenWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-lime-700" />
                  <span>Consultar con otra sede</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* 3 Quick Cards Summary below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <div
            onClick={() => setActiveTab('domicilios')}
            className={`p-6 rounded-3xl bg-white border transition-all cursor-pointer ${
              activeTab === 'domicilios'
                ? 'border-orange-500 shadow-lg ring-2 ring-orange-200'
                : 'border-slate-200 hover:border-orange-300 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Domicilios Betel</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Envíos desde $3.000. Haz tu pedido al 317 679 7058 de 7:00 a.m. a 7:00 p.m.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('puntos')}
            className={`p-6 rounded-3xl bg-white border transition-all cursor-pointer ${
              activeTab === 'puntos'
                ? 'border-lime-500 shadow-lg ring-2 ring-lime-200'
                : 'border-slate-200 hover:border-lime-300 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Gana Puntos Betel</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Acumula el 0,3% de todas tus compras y duplica tus puntos el día de tu cumpleaños.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('botellon')}
            className={`p-6 rounded-3xl bg-white border transition-all cursor-pointer ${
              activeTab === 'botellon'
                ? 'border-teal-500 shadow-lg ring-2 ring-teal-200'
                : 'border-slate-200 hover:border-teal-300 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <Droplets className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Agua La Huerta</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recarga de botellón purificado y potable a solo $8.900 en todas nuestras sedes.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
