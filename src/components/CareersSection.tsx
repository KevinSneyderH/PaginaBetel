import { ArrowUpRight, BriefcaseBusiness, HeartHandshake, Mail, MapPin, Users } from 'lucide-react';

const benefits = [
  { icon: Users, title: 'Un equipo que crece unido', description: 'Personas comprometidas que trabajan por un propósito común.' },
  { icon: MapPin, title: 'Orgullo de nuestra región', description: 'Aportamos al desarrollo de Norte de Santander desde cada sede.' },
  { icon: HeartHandshake, title: 'Servicio con sentido humano', description: 'Creamos experiencias cercanas para las familias que nos eligen.' },
];

const vacancies = [
  { title: 'Auxiliar en Cajero/a', description: 'Atención al cliente, registro de productos y manejo de caja.' },
  { title: 'Auxiliar de surtido', description: 'Organización, rotación y reposición de productos en tienda.' },
  { title: 'Auxiliar de cafetería', description: 'Apoyo en la preparación y atención de nuestros clientes.' },
];

const recruitmentEmail = 'seleccionrh.betel@gmail.com';

function applicationLink(position: string) {
  const subject = encodeURIComponent(`Hoja de vida - Vacante de ${position}`);
  const body = encodeURIComponent(`Hola, equipo de Selección Betel:\n\nQuiero postularme a la vacante de ${position}. Adjunto mi hoja de vida para su consideración.\n\nNombre:\nTeléfono:\nCiudad:`);
  return `mailto:${recruitmentEmail}?subject=${subject}&body=${body}`;
}

export function CareersSection() {
  return (
    <section id="trabaja" className="relative overflow-hidden bg-[#f5f8ed] py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <BriefcaseBusiness className="h-4 w-4 text-orange-500" /> Oportunidades Betel
            </div>
            <h2 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              Crezcamos juntos. <span className="text-emerald-700">Trabaja con nosotros.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              En Supermercados Betel creemos que un gran servicio empieza con grandes personas. Si te identificas con el compromiso, la calidez y el trabajo en equipo, queremos conocerte.
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Mail className="h-4 w-4" /> Envía tu postulación a Selección Betel
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-lime-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-emerald-800">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tu talento suma</p>
                  <h3 className="text-xl font-black text-slate-900">¿Qué nos mueve?</h3>
                </div>
              </div>
              <div className="space-y-5">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Únete al equipo</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Vacantes disponibles</h3>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-slate-600">Selecciona un cargo para preparar tu correo. Recuerda adjuntar tu hoja de vida antes de enviarlo.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {vacancies.map(({ title, description }) => (
              <article key={title} className="flex flex-col rounded-2xl border border-lime-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100 text-emerald-800">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-black text-slate-900">{title}</h4>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
                <a
                  href={applicationLink(title)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                >
                  Postularme <ArrowUpRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">También puedes enviar tu hoja de vida a <a className="font-semibold text-emerald-800 underline" href={`mailto:${recruitmentEmail}`}>{recruitmentEmail}</a>.</p>
        </div>
      </div>
    </section>
  );
}
