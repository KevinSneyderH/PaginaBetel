import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchVisualAssets, type VisualAsset } from "../utils/visualContentApi";

const AUTOPLAY_INTERVAL = 5000;
/** Minimum px the finger must travel to count as a swipe */
const SWIPE_THRESHOLD = 40;

interface SizedVisualAsset extends VisualAsset {
  width: number;
  height: number;
}

function loadImageDimensions(slide: VisualAsset): Promise<SizedVisualAsset | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ ...slide, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = slide.imageUrl;
  });
}

/** Preload an image into the browser cache so it's ready when displayed */
function preloadImage(url: string) {
  const img = new Image();
  img.src = url;
}

function hasDesktopDimensions(slide: SizedVisualAsset) {
  const desktopRatio = 1920 / 640;
  return slide.width >= 1920 && slide.height >= 640 && Math.abs(slide.width / slide.height - desktopRatio) < 0.05;
}

function hasMobileDimensions(slide: SizedVisualAsset) {
  const mobileRatio = 1080 / 1350;
  return slide.width <= 1080 && slide.height <= 1350 && Math.abs(slide.width / slide.height - mobileRatio) < 0.05;
}

export function BannerSlider() {
  const [allSlides, setAllSlides] = useState<SizedVisualAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => document.visibilityState === "visible");
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);

  // Guard: prevents navigation while a CSS transition is in progress
  const isAnimatingRef = useRef(false);

  // Touch/swipe state
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchDeltaRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0); // px offset while dragging
  const isDraggingRef = useRef(false);
  const trackContainerRef = useRef<HTMLDivElement>(null);

  const slides = useMemo(
    () => allSlides.filter(isMobile ? hasMobileDimensions : hasDesktopDimensions),
    [allSlides, isMobile],
  );

  // Preload all slide images once they are known so rapid navigation never shows blanks
  useEffect(() => {
    slides.forEach((slide) => preloadImage(slide.imageUrl));
  }, [slides]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    let mounted = true;
    void fetchVisualAssets("SLIDE")
      .then(async (data) => {
        const slidesWithDimensions = await Promise.all(data.map(loadImageDimensions));
        if (mounted) setAllSlides(slidesWithDimensions.filter((slide): slide is SizedVisualAsset => slide !== null));
      })
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
        isAnimatingRef.current = false;
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
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex(((index + slides.length) % slides.length) + 1);
  }, [slides.length]);

  const next = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex((index) => index + 1);
  }, []);

  const prev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex((index) => index - 1);
  }, []);

  function handleTrackTransitionEnd() {
    if (trackIndex === 0 || trackIndex === slides.length + 1) {
      setTransitionEnabled(false);
      setTrackIndex(trackIndex === 0 ? slides.length : 1);
    }
    // Unlock navigation once the transition finishes
    isAnimatingRef.current = false;
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

  // ── Touch / swipe handlers ──────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (slides.length < 2) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDeltaRef.current = 0;
    isDraggingRef.current = false;
    setIsPaused(true);
  }, [slides.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (slides.length < 2) return;
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    // Only start horizontal drag if the gesture is predominantly horizontal
    if (!isDraggingRef.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        isDraggingRef.current = true;
      } else {
        return; // let vertical scroll happen
      }
    }

    // Prevent vertical scroll while dragging the slider
    e.preventDefault();

    touchDeltaRef.current = deltaX;
    setDragOffset(deltaX);
  }, [slides.length]);

  const handleTouchEnd = useCallback(() => {
    if (slides.length < 2) return;

    const delta = touchDeltaRef.current;
    setDragOffset(0);
    isDraggingRef.current = false;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    }

    // Unpause autoplay after a brief delay
    setTimeout(() => setIsPaused(false), 300);
  }, [slides.length, next, prev]);

  // Compute the translate value for the track
  const getTrackTranslate = () => {
    const basePercent = (trackIndex * 100) / slidesWithClones.length;
    if (dragOffset !== 0 && trackContainerRef.current) {
      const containerWidth = trackContainerRef.current.offsetWidth;
      // Convert px drag offset to a percentage of the full track width
      const dragPercent = (dragOffset / containerWidth) * (100 / slidesWithClones.length);
      return basePercent - dragPercent;
    }
    return basePercent;
  };

  if (loading) {
    return <section className="flex aspect-[4/5] w-full items-center justify-center bg-slate-900 text-sm text-white/70 sm:aspect-[3/1]" role="status">Cargando imágenes...</section>;
  }
  if (loadError) {
    return <section className="flex aspect-[4/5] w-full items-center justify-center bg-slate-900 text-sm text-white/70 sm:aspect-[3/1]" role="status">Las imágenes destacadas no están disponibles.</section>;
  }
  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackContainerRef}
        className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 sm:aspect-[3/1]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.length === 1 ? (
          <img src={slides[0].imageUrl} alt={slides[0].titulo} className="size-full object-cover" />
        ) : (
          <div
            className={
              "flex h-full " +
              (transitionEnabled && dragOffset === 0
                ? "transition-transform duration-700 ease-in-out"
                : "")
            }
            style={{
              width: (slidesWithClones.length * 100) + "%",
              transform: "translateX(-" + getTrackTranslate() + "%)",
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {slidesWithClones.map((slide, index) => (
              <img
                key={slide.id_contenido + "-" + index}
                src={slide.imageUrl}
                alt={slide.titulo}
                className="h-full flex-none bg-slate-900 object-cover"
                style={{ width: (100 / slidesWithClones.length) + "%" }}
                loading="eager"
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
