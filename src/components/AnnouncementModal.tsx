import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchVisualAssets, type VisualAsset } from '../utils/visualContentApi';

interface ResponsiveAnnouncement {
  desktop: VisualAsset | null;
  mobile: VisualAsset | null;
}

function loadImage(asset: VisualAsset): Promise<{ asset: VisualAsset; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ asset, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = asset.imageUrl;
  });
}

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState<ResponsiveAnnouncement>({ desktop: null, mobile: null });
  const [cargando, setCargando] = useState(true);
  const [errorConsulta, setErrorConsulta] = useState(false);
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    let mounted = true;
    void fetchVisualAssets('ANUNCIO')
      .then(async (assets) => {
        const sizedAssets = await Promise.all(assets.map(loadImage));
        const availableAssets = sizedAssets.filter((asset): asset is NonNullable<typeof asset> => asset !== null);
        const desktop = availableAssets.find(({ width, height }) => width >= 1200 && height >= 800 && width > height)?.asset ?? null;
        const mobile = availableAssets.find(({ width, height }) => width >= 1122 && height >= 1402 && height > width)?.asset ?? null;
        if (mounted) setAnnouncement({ desktop, mobile });
      })
      .catch(() => {
        if (!mounted) return;
        setAnnouncement({ desktop: null, mobile: null });
        setErrorConsulta(true);
      })
      .finally(() => { if (mounted) setCargando(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const desktopImage = announcement.desktop ?? announcement.mobile;
  const mobileImage = announcement.mobile ?? announcement.desktop;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <section
        aria-label="Anuncio de Supermercados Betel"
        aria-modal="true"
        className="relative flex max-h-[90dvh] max-w-[min(1200px,92vw)] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute -right-2 -top-2 z-10 flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Cerrar anuncio"
        >
          <X size={22} aria-hidden="true" />
        </button>
        {cargando ? (
          <p className="rounded-xl bg-white px-6 py-4 text-sm text-slate-700 shadow-xl" role="status">Cargando anuncio…</p>
        ) : errorConsulta || (!desktopImage && !mobileImage) ? (
          <p className="rounded-xl bg-white px-6 py-4 text-sm text-slate-700 shadow-xl" role="status">
            {errorConsulta ? "No se pudo consultar el anuncio en este momento." : "No hay imágenes activas de anuncio con las medidas requeridas."}
          </p>
        ) : errorImagen ? (
          <p className="rounded-xl bg-white px-6 py-4 text-sm text-slate-700 shadow-xl" role="alert">No se pudo cargar la imagen del anuncio.</p>
        ) : (
          <picture>
            {mobileImage && <source media="(max-width: 640px)" srcSet={mobileImage.imageUrl} />}
            {desktopImage && <img
              src={desktopImage.imageUrl}
              alt={desktopImage.titulo || "Anuncio de Supermercados Betel"}
              className="max-h-[90dvh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onError={() => setErrorImagen(true)}
            />}
          </picture>
        )}
      </section>
    </div>
  );
}
