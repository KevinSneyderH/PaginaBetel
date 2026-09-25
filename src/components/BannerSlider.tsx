import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  { src: '/images/slider/16.png', alt: 'Supermercados Betel - Promoción 16' },
  { src: '/images/slider/24.png', alt: 'Supermercados Betel - Servicio 24 Horas' },
  { src: '/images/slider/Banner-de-domicilias.png', alt: 'Supermercados Betel - Domicilios' },
  { src: '/images/slider/banner-gana-puntos.png', alt: 'Supermercados Betel - Gana Puntos' },
  { src: '/images/slider/BANNER-MEDIOS.png', alt: 'Supermercados Betel - Medios de Pago' },
  { src: '/images/slider/botellon-baner.png', alt: 'Supermercados Betel - Botellón Agua La Huerta' },
  { src: '/images/slider/cafeteria.png', alt: 'Supermercados Betel - Cafetería' },
  { src: '/images/slider/Cafeterias.png', alt: 'Supermercados Betel - Cafeterías Betel' },
];

const AUTOPLAY_INTERVAL = 5000;

export function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] md:aspect-[3.5/1]">
        {SLIDES.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}
      </div>

      {/* Arrow: Previous */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Arrow: Next */}
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all cursor-pointer ${
              index === current
                ? 'w-8 h-2.5 bg-orange-500 shadow-md shadow-orange-500/40'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/20">
        <div
          className="h-full bg-gradient-to-r from-lime-500 to-orange-500 transition-all duration-300"
          style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
        />
      </div>
    </section>
  );
}
