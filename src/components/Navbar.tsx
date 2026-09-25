import { useState, useEffect } from 'react';
import { Menu, X, Phone, ShoppingBag, Clock } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { assetPath } from '../utils/assetPath';

interface NavbarProps {
  onOpenWhatsApp: (sedeId?: string) => void;
}

export function Navbar({ onOpenWhatsApp }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Sedes', href: '#sedes' },
    { name: 'Promociones', href: '#promociones' },
    { name: 'Cafeterías', href: '#cafeterias' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Sostenibilidad', href: '#sostenibilidad' },
  ];

  return (
    <>
      {/* Top Banner Alert with Betel Lime & Orange Accents */}
      <div className="bg-gradient-to-r from-lime-900 via-emerald-900 to-slate-900 text-white text-xs sm:text-sm py-2 px-4 font-medium border-b border-lime-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span>
              <strong className="text-lime-300">¡34 Años Contigo!</strong> Domicilios y Servicio Nocturno en sedes seleccionadas
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> Sedes 24h & Ventanilla
            </span>
            <span className="opacity-40">|</span>
            <button
              onClick={() => onOpenWhatsApp()}
              className="hover:underline flex items-center gap-1 text-orange-300 cursor-pointer font-bold"
            >
              <Phone className="w-3.5 h-3.5" /> Domicilios: 317 679 7058
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-md shadow-md py-2.5'
            : 'bg-slate-900 py-3.5 border-b border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3 group">
              <img
                src={assetPath('/logo.png')}
                alt="Supermercados Betel"
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-bold text-slate-200 hover:text-lime-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-orange-500 hover:after:w-full after:transition-all"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* CTA Buttons in Betel Orange & Lime */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => onOpenWhatsApp()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pedir Domicilio</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => onOpenWhatsApp()}
                className="sm:hidden p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                aria-label="Pedir Domicilio"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-200 hover:text-lime-400 hover:bg-slate-800 focus:outline-none"
                aria-label="Abrir Menú"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 shadow-xl px-4 pt-4 pb-6 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-base font-bold text-slate-200 hover:bg-slate-800 hover:text-lime-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-800 mt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWhatsApp();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-md"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Pedir Domicilio por WhatsApp</span>
                </button>
                <a
                  href={`tel:${COMPANY_DATA.generalPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-200 py-2.5 rounded-xl font-semibold"
                >
                  <Phone className="w-4 h-4 text-lime-700" />
                  <span>Llamar: {COMPANY_DATA.generalPhone}</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
