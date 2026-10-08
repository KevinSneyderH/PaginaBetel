import { useEffect, useState } from 'react';
import { assetPath } from '../utils/assetPath';

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <section
        aria-label="Anuncio de Supermercados Betel"
        aria-modal="true"
        className="flex max-h-[90dvh] max-w-[min(1200px,92vw)] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet={assetPath('/images/anuncio-inicio-movil.png')}
          />
          <img
            src={assetPath('/images/anuncio-inicio-desktop.jpg')}
            alt="Anuncio de Supermercados Betel"
            className="max-h-[90dvh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            onError={() => setIsOpen(false)}
          />
        </picture>
      </section>
    </div>
  );
}
