import { Sun, Recycle, Leaf } from 'lucide-react';

const pillars = [
  {
    title: 'Sostenibilidad ambiental',
    label: 'Energía limpia',
    icon: Sun,
    description: (
      <>
        En <strong>Supermercados Betel</strong> trabajamos por un futuro más limpio implementando <strong>paneles solares en nuestras sedes</strong>, generando energía renovable y reduciendo nuestra huella ambiental. Esta iniciativa disminuye la emisión de gases contaminantes y contribuye al cuidado del planeta, demostrando que es posible crecer mientras protegemos el medio ambiente.
      </>
    ),
    slogan: 'En Betel creemos en la energía limpia para un mejor mañana.',
    video: 'https://www.youtube.com/embed/EecMZ8NrI_0',
  },
  {
    title: 'Economía Circular',
    label: 'Reciclaje con propósito',
    icon: Recycle,
    description: (
      <>
        En <strong>Supermercados Betel</strong> promovemos la <strong>economía circular</strong>, dando una segunda vida a materiales como cartón y otros reciclables. A través de esta iniciativa, no solo reducimos el impacto ambiental, sino que también <strong>apoyamos a fundaciones y organizaciones sociales</strong>, contribuyendo a generar recursos que benefician a comunidades y causas solidarias.
      </>
    ),
    slogan: 'En Betel transformamos el reciclaje en oportunidades para el planeta y para las personas.',
    video: 'https://www.youtube.com/embed/cubKxHdZMy0',
  },
];

export function SocialResponsibilitySection() {
  return (
    <section id="sostenibilidad" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Leaf className="w-3.5 h-3.5" /> Responsabilidad Social & Ambiental
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Cuidamos Nuestra Tierra y Nuestra Comunidad</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pillars.map(({ title, label, icon: Icon, description, slogan, video }) => (
            <article key={title} className="bg-emerald-900/40 rounded-3xl p-8 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-800/80 rounded-lg text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{label}</div>
              <h3 className="text-2xl font-black text-white mb-4">{title}</h3>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">{description}</p>
              <p className="pt-6 border-t border-emerald-800/60 text-sm font-semibold text-emerald-300">{slogan}</p>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
                <iframe className="h-full w-full" src={video} title={`${title} en Supermercados Betel`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
