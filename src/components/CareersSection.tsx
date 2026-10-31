import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Clock,
  HeartHandshake,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { useCambiosEnVivo } from "../utils/realtime";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const recruitmentEmail = "seleccionrh.betel@gmail.com";
const recruitmentWhatsapp = "3175177648";
const recruitmentWhatsappDisplay = "317 517 7648";

type Vacancy = {
  id_vacante: number;
  titulo: string;
  cargo: string;
  area: string | null;
  descripcion: string;
  funciones: string | null;
  requisitos: string | null;
  ubicacion: string | null;
  modalidad: string | null;
  tipo_contrato: string | null;
  salario: string | null;
  fecha_publicacion: string;
  fecha_cierre: string | null;
  correo_postulacion: string | null;
  imagen_url: string | null;
};

const benefits = [
  {
    icon: Users,
    title: "Un equipo que crece unido",
    description: "Personas comprometidas que trabajan por un propósito común.",
  },
  {
    icon: MapPin,
    title: "Orgullo de nuestra región",
    description:
      "Aportamos al desarrollo de Norte de Santander desde cada sede.",
  },
  {
    icon: HeartHandshake,
    title: "Servicio con sentido humano",
    description:
      "Creamos experiencias cercanas para las familias que nos eligen.",
  },
];

function applicationLink(position: string, email: string) {
  const subject = encodeURIComponent(`Hoja de vida - Convocatoria de ${position}`);
  const body = encodeURIComponent(
    `Hola, equipo de Selección Betel:\n\nQuiero postularme a la vacante de ${position}. Adjunto mi hoja de vida para su consideración.\n\nNombre completo:\nTeléfono:\nCiudad:\n\n¡Muchas gracias!`,
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function whatsappLink(position: string) {
  const message = encodeURIComponent(
    `¡Hola! Vi la convocatoria para "${position}" en el portal web de Supermercados Betel y deseo postularme con mi hoja de vida.`,
  );
  return `https://wa.me/57${recruitmentWhatsapp}?text=${message}`;
}

function formatoFecha(valor: string | null) {
  if (!valor) return null;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${valor}T00:00:00Z`));
}

export function CareersSection({ onInitialLoad }: { onInitialLoad?: () => void } = {}) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [aficheEnGrande, setAficheEnGrande] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!selectedVacancy && !aficheEnGrande) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (aficheEnGrande) {
          setAficheEnGrande(null);
        } else {
          setSelectedVacancy(null);
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedVacancy, aficheEnGrande]);

  const loadVacancies = useCallback(async () => {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      setError(
        "La conexión con el servicio de vacantes no está configurada.",
      );
      setLoading(false);
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        onInitialLoad?.();
      }
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const url = new URL(`${SUPABASE_URL}/rest/v1/vacantes`);
    url.search = new URLSearchParams({
      select:
        "id_vacante,titulo,cargo,area,descripcion,funciones,requisitos,ubicacion,modalidad,tipo_contrato,salario,fecha_publicacion,fecha_cierre,correo_postulacion,imagen_url",
      publicada: "eq.true",
      estado: "eq.ABIERTA",
      order: "fecha_publicacion.desc",
    }).toString();

    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `La consulta respondió con el estado ${response.status}.`,
        );
      }

      const data: Vacancy[] = await response.json();
      setVacancies(data);
      setSelectedVacancy((prev) => (prev ? data.find((v) => v.id_vacante === prev.id_vacante) ?? null : null));
      setError("");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("No pudimos cargar las vacantes. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        onInitialLoad?.();
      }
    }
  }, [onInitialLoad]);

  useEffect(() => {
    void loadVacancies();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadVacancies]);

  useCambiosEnVivo(["vacantes"], loadVacancies);

  return (
    <section
      id="trabaja"
      className="relative overflow-hidden bg-[#f5f8ed] py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 shadow-xs">
              <BriefcaseBusiness className="h-4 w-4 text-orange-500" />
              Oportunidades Betel
            </div>

            <h2 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              Crezcamos juntos.{" "}
              <span className="text-emerald-700">Trabaja con nosotros.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              En Supermercados Betel creemos que un gran servicio empieza con
              grandes personas. Si te identificas con el compromiso, la calidez
              y el trabajo en equipo, queremos conocerte.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-emerald-800">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                {recruitmentEmail}
              </span>
              <span className="text-slate-300">·</span>
              <a
                href={`https://wa.me/57${recruitmentWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp: {recruitmentWhatsappDisplay}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-lime-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-emerald-800">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Tu talento suma
                  </p>
                  <h3 className="text-xl font-black text-slate-900">
                    ¿Qué nos mueve?
                  </h3>
                </div>
              </div>

              <div className="space-y-5">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Únete al equipo
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Vacantes disponibles
              </h3>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-slate-600">
              Explora las convocatorias abiertas, consulta los afiches y postúlate directamente por WhatsApp o correo.
            </p>
          </div>

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando vacantes">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} aria-hidden="true" className="animate-pulse overflow-hidden rounded-3xl border border-lime-100 bg-white shadow-sm">
                  <div className="h-52 w-full bg-slate-200" />
                  <div className="p-6">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
                    <div className="mt-6 flex gap-2">
                      <div className="h-7 w-20 rounded-lg bg-slate-100" />
                      <div className="h-7 w-24 rounded-lg bg-slate-100" />
                    </div>
                    <div className="mt-6 h-11 w-full rounded-xl bg-lime-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p
              className="rounded-2xl bg-white p-6 text-sm text-red-700 shadow-sm"
              role="alert"
            >
              {error}
            </p>
          )}

          {!loading && !error && vacancies.length === 0 && (
            <div className="rounded-3xl border border-lime-100 bg-white p-10 text-center shadow-sm">
              <BriefcaseBusiness className="mx-auto size-12 text-slate-300" />
              <h4 className="mt-3 text-lg font-bold text-slate-800">No hay vacantes activas en este momento</h4>
              <p className="mt-1 text-sm text-slate-600">
                Vuelve a consultar pronto o envía tu hoja de vida a {recruitmentEmail}.
              </p>
            </div>
          )}

          {!loading && !error && vacancies.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vacancies.map((vacancy) => {
                const title = vacancy.titulo || vacancy.cargo;

                return (
                  <article
                    key={vacancy.id_vacante}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-lime-200/80 bg-white shadow-md shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10"
                  >
                    {/* Header visual: Afiche o Banner ilustrado */}
                    {vacancy.imagen_url ? (
                      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                        <img
                          src={vacancy.imagen_url}
                          alt={`Afiche de ${title}`}
                          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30"
                        />
                        <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
                            <span className="size-2 rounded-full bg-lime-300 animate-pulse" />
                            Convocatoria abierta
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
                            <ImageIcon className="size-3 text-lime-300" />
                            Afiche
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 drop-shadow-sm">
                            <BriefcaseBusiness className="size-3.5 text-lime-300" />
                            {vacancy.area || "Supermercados Betel"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-5 text-white flex flex-col justify-between">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-lime-400/20 blur-2xl"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -left-6 -bottom-6 size-32 rounded-full bg-orange-400/15 blur-2xl"
                        />
                        <BriefcaseBusiness
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-3 -bottom-4 size-28 text-white/5"
                        />
                        <div className="relative flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-lime-200 backdrop-blur-md">
                            <span className="size-2 rounded-full bg-lime-400 animate-pulse" />
                            Convocatoria abierta
                          </span>
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-300/80">
                            Betel Empleo
                          </span>
                        </div>
                        <div className="relative">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-100">
                            <BriefcaseBusiness className="size-3.5 text-lime-300" />
                            {vacancy.area || "Supermercados Betel"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contenido de la tarjeta */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="min-w-0">
                        <h4 className="text-xl font-black leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-emerald-800 line-clamp-2">
                          {title}
                        </h4>
                        {vacancy.cargo !== title && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {vacancy.cargo}
                          </p>
                        )}
                      </div>

                      {/* Chips de atributos rápidos */}
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {vacancy.ubicacion && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50/80 px-2.5 py-1 text-xs font-bold text-orange-800">
                            <MapPin className="size-3.5 text-orange-600" />
                            {vacancy.ubicacion}
                          </span>
                        )}
                        {vacancy.modalidad && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            <Clock className="size-3.5 text-slate-500" />
                            {vacancy.modalidad}
                          </span>
                        )}
                        {vacancy.salario && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <Banknote className="size-3.5 text-emerald-600" />
                            {vacancy.salario}
                          </span>
                        )}
                      </div>

                      <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {vacancy.descripcion}
                      </p>

                      {/* Botones de acción */}
                      <div className="mt-auto flex flex-col gap-2 pt-5">
                        <button
                          type="button"
                          onClick={() => setSelectedVacancy(vacancy)}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                          Ver vacante {vacancy.imagen_url ? "y afiche" : "completa"}
                          <ArrowUpRight className="size-4" />
                        </button>
                        <a
                          href={whatsappLink(title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 text-xs font-bold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100/80 active:scale-[0.98]"
                        >
                          <MessageCircle className="size-4 text-emerald-700" />
                          Postularme por WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Modal de Detalle de Vacante */}
          {selectedVacancy && (() => {
            const title = selectedVacancy.titulo || selectedVacancy.cargo;
            const applicationEmail = selectedVacancy.correo_postulacion || recruitmentEmail;
            const details = [
              ["Área", selectedVacancy.area],
              ["Ubicación", selectedVacancy.ubicacion],
              ["Modalidad", selectedVacancy.modalidad],
              ["Tipo de contrato", selectedVacancy.tipo_contrato],
              ["Salario", selectedVacancy.salario],
              ["Publicada", formatoFecha(selectedVacancy.fecha_publicacion)],
              ["Fecha de cierre", formatoFecha(selectedVacancy.fecha_cierre)],
            ].filter(([, value]) => value);

            const tieneAfiche = Boolean(selectedVacancy.imagen_url);

            return (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSelectedVacancy(null);
                }}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="vacancy-dialog-title"
                  className={`flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] ${
                    tieneAfiche ? "sm:max-w-4xl" : "sm:max-w-2xl"
                  } sm:rounded-3xl`}
                >
                  {/* Encabezado del modal */}
                  <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 px-5 py-5 text-white sm:px-7 sm:py-6">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-lime-300/15 blur-2xl"
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-lime-200">
                          <BriefcaseBusiness className="size-3.5" /> Convocatoria Betel
                        </span>
                        <h3 id="vacancy-dialog-title" className="mt-2 break-words text-2xl font-black sm:text-3xl">
                          {title}
                        </h3>
                        {selectedVacancy.cargo !== title && (
                          <p className="mt-1 text-sm text-emerald-100">{selectedVacancy.cargo}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        autoFocus
                        onClick={() => setSelectedVacancy(null)}
                        aria-label="Cerrar detalles"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  </header>

                  {/* Cuerpo del modal */}
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className={tieneAfiche ? "md:grid md:grid-cols-12 md:divide-x md:divide-slate-100" : ""}>
                      {/* Columna izquierda: Afiche oficial */}
                      {tieneAfiche && selectedVacancy.imagen_url && (
                        <div className="bg-slate-950 p-4 sm:p-6 md:col-span-5 flex flex-col items-center justify-center text-center">
                          <div className="group relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
                            <img
                              src={selectedVacancy.imagen_url}
                              alt={`Afiche de ${title}`}
                              className="mx-auto max-h-[460px] w-auto object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                              onClick={() => setAficheEnGrande(selectedVacancy.imagen_url)}
                            />
                            <div
                              onClick={() => setAficheEnGrande(selectedVacancy.imagen_url)}
                              className="absolute inset-0 flex cursor-zoom-in items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-lg">
                                <ZoomIn className="size-4" /> Ampliar afiche
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAficheEnGrande(selectedVacancy.imagen_url)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-lime-300 hover:text-lime-200"
                          >
                            <ZoomIn className="size-3.5" /> Ver afiche en pantalla completa
                          </button>
                        </div>
                      )}

                      {/* Columna derecha (o única): Datos de la vacante */}
                      <div className={`p-5 sm:p-7 ${tieneAfiche ? "md:col-span-7" : ""} space-y-6`}>
                        {/* Grilla de atributos */}
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {details.map(([label, value]) => (
                            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/90 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                              <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Descripción, Funciones, Requisitos */}
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Descripción del cargo</h4>
                            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
                              {selectedVacancy.descripcion}
                            </p>
                          </div>

                          {selectedVacancy.funciones && (
                            <div>
                              <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Funciones principales</h4>
                              <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
                                {selectedVacancy.funciones}
                              </p>
                            </div>
                          )}

                          {selectedVacancy.requisitos && (
                            <div>
                              <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Requisitos del perfil</h4>
                              <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
                                {selectedVacancy.requisitos}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pie del modal: Botones de postulación */}
                  <footer className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-7 sm:py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-slate-500">
                        Canales de recepción de hojas de vida:{" "}
                        <strong className="text-slate-700">WhatsApp ({recruitmentWhatsappDisplay})</strong> o{" "}
                        <a href={`mailto:${applicationEmail}`} className="font-semibold text-emerald-800 underline">
                          {applicationEmail}
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={whatsappLink(title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] sm:flex-initial"
                        >
                          <MessageCircle className="size-4" />
                          Postularme por WhatsApp
                        </a>
                        <a
                          href={applicationLink(title, applicationEmail)}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                          <Mail className="size-4 text-slate-500" />
                          Correo
                        </a>
                      </div>
                    </div>
                  </footer>
                </section>
              </div>
            );
          })()}

          {/* Lightbox para ver afiche en pantalla completa */}
          {aficheEnGrande && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
              onClick={() => setAficheEnGrande(null)}
            >
              <button
                type="button"
                onClick={() => setAficheEnGrande(null)}
                aria-label="Cerrar afiche"
                className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="size-6" />
              </button>
              <img
                src={aficheEnGrande}
                alt="Afiche oficial de la vacante en tamaño completo"
                className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
              />
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500 sm:text-left">
            También puedes enviar tu hoja de vida directamente a{" "}
            <a
              className="font-semibold text-emerald-800 underline"
              href={`mailto:${recruitmentEmail}`}
            >
              {recruitmentEmail}
            </a>{" "}
            o al WhatsApp {recruitmentWhatsappDisplay}.
          </p>
        </div>
      </div>
    </section>
  );
}
