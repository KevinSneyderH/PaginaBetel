import { useEffect } from "react";

/**
 * Hook de Scroll Reveal optimizado con IntersectionObserver.
 * Observa todos los elementos con el atributo [data-reveal].
 * Cuando entran en el viewport (umbral 10%), agrega la clase 'is-visible'
 * y deja de observarlos para liberar memoria y mantener un rendimiento de 60fps.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback para entornos sin soporte: hacer todo visible de inmediato
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll("[data-reveal]:not(.is-visible)");
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    // MutationObserver para detectar elementos dinámicos (como tarjetas de sedes o vacantes al cargar datos)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

