import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchVisualAssets, type VisualAsset } from "../utils/visualContentApi";

const AUTOPLAY_INTERVAL = 5000;

export function BannerSlider() {
  const [slides, setSlides] = useState<VisualAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => document.visibilityState === "visible");

  useEffect(() => {
    let mounted = true;
    void fetchVisualAssets("SLIDE")
      .then((data) => { if (mounted) setSlides(data); })
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setTrackIndex(slides.length > 1 ? 1 : 0);
  }, [slides.length]);
  useEffect(() => {
    const actualizarVisibilidad = () => {
      const visible = document.visibilityState === "visible";
      setIsDocumentVisible(visible);

      if (visible && slides.length > 1) {
        setTransitionEnabled(false);
        setTrackIndex((indice) => ((indice - 1) % slides.length + slides.length) % slides.length + 1);
      }
    };

    document.addEventListener("visibilitychange", actualizarVisibilidad);
    return () => document.removeEventListener("visibilitychange", actualizarVisibilidad);
  }, [slides.length]);


  const slidesWithClones = slides.length > 1
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides;
  const current = slides.length > 1
    ? trackIndex === 0
      ? slides.length - 1
      : trackIndex === slides.length + 1
        ? 0
        : trackIndex - 1
    : 0;

  const goTo = useCallback((index: number) => {
    setTransitionEnabled(true);
    setTrackIndex(((index + slides.length) % slides.length) + 1);
  }, [slides.length]);

  const next = useCallback(() => {
    setTransitionEnabled(true);
    setTrackIndex((index) => index + 1);
  }, []);
  const prev = useCallback(() => {
    setTransitionEnabled(true);
    setTrackIndex((index) => index - 1);
  }, []);

  function handleTrackTransitionEnd() {
    if (trackIndex === 0 || trackIndex === slides.length + 1) {
      setTransitionEnabled(false);
      setTrackIndex(trackIndex === 0 ? slides.length : 1);
    }
  }

  useEffect(() => {
    if (transitionEnabled) return;
    const frame = requestAnimationFrame(() => setTransitionEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, [transitionEnabled]);

  useEffect(() => {
    if (isPaused || !isDocumentVisible || slides.length < 2) return;
    const timer = window.setInterval(next, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [next, isPaused, isDocumentVisible, slides.length]);

  if (loading) {
    return <section className="flex aspect-[3/1] w-full items-center justify-center bg-slate-900 text-sm text-white/70" role="status">Cargando imágenes...</section>;
  }
  if (loadError) {
    return <section className="flex aspect-[3/1] w-full items-center justify-center bg-slate-900 text-sm text-white/70" role="status">Las imágenes destacadas no están disponibles.</section>;
  }
  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[3/1] w-full overflow-hidden bg-slate-900">
        {slides.length === 1 ? (
          <img src={slides[0].imageUrl} alt={slides[0].titulo} className="size-full object-contain" />
        ) : (
          <div
            className={"flex h-full " + (transitionEnabled ? "transition-transform duration-700 ease-in-out" : "")}
            style={{
              width: (slidesWithClones.length * 100) + "%",
              transform: "translateX(-" + ((trackIndex * 100) / slidesWithClones.length) + "%)",
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {slidesWithClones.map((slide, index) => (
              <img
                key={slide.id_contenido + "-" + index}
                src={slide.imageUrl}
                alt={slide.titulo}
                className="h-full flex-none bg-slate-900 object-contain"
                style={{ width: (100 / slidesWithClones.length) + "%" }}
                loading={index === 1 ? "eager" : "lazy"}
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && <>
        <button type="button" onClick={prev} className="absolute left-2 top-1/2 z-20 flex h-10 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/15 text-white transition hover:bg-black/35 sm:left-4 sm:h-12 sm:w-10" aria-label="Anterior"><ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" /></button>
        <button type="button" onClick={next} className="absolute right-2 top-1/2 z-20 flex h-10 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/15 text-white transition hover:bg-black/35 sm:right-4 sm:h-12 sm:w-10" aria-label="Siguiente"><ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" /></button>
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
          {slides.map((slide, index) => (
            <button key={slide.id_contenido} type="button" onClick={() => goTo(index)} className={"rounded-full transition-all " + (index === current ? "h-2.5 w-8 bg-orange-500 shadow-md shadow-orange-500/40" : "size-2.5 bg-white/50 hover:bg-white/80")} aria-label={"Ir a slide " + (index + 1)} aria-current={index === current ? "true" : undefined} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/20">
          <div className="h-full bg-gradient-to-r from-lime-500 to-orange-500 transition-all duration-300" style={{ width: (((current + 1) / slides.length) * 100) + "%" }} />
        </div>
      </>}
    </section>
  );
}