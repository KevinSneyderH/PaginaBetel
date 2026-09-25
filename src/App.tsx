import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BannerSlider } from './components/BannerSlider';
import { Hero } from './components/Hero';
import { SedesSection } from './components/SedesSection';
import { PromotionsSection } from './components/PromotionsSection';
import { CafeteriaSection } from './components/CafeteriaSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { SocialResponsibilitySection } from './components/SocialResponsibilitySection';
import { Footer } from './components/Footer';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { WhatsAppModal } from './components/WhatsAppModal';
import type { Sede } from './data/sedesData';

export default function App() {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [initialSedeForWhatsApp, setInitialSedeForWhatsApp] = useState<Sede | null>(null);

  const handleOpenWhatsApp = (sede?: Sede) => {
    setInitialSedeForWhatsApp(sede || null);
    setIsWhatsAppModalOpen(true);
  };

  const handleCloseWhatsApp = () => {
    setIsWhatsAppModalOpen(false);
    setInitialSedeForWhatsApp(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Sticky Smart Navigation */}
      <Navbar onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* Banner Slider */}
      <BannerSlider />

      {/* Hero Section */}
      <Hero onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* Interactive Sedes Explorer (10 Sedes, Filter, Search, Badges) */}
      <SedesSection onSelectSedeForWhatsApp={(sede) => handleOpenWhatsApp(sede)} />

      {/* Daily Promotions Section */}
      <PromotionsSection onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* Cafeterias Betel Section */}
      <CafeteriaSection onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* Services, Benefits & Water Delivery */}
      <ServicesSection onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* About Us (34 Years, Mission, Vision & Values) */}
      <AboutSection />

      {/* Social & Environmental Responsibility (Solar Energy & Circular Economy) */}
      <SocialResponsibilitySection />

      {/* Footer */}
      <Footer onOpenWhatsApp={() => handleOpenWhatsApp()} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsAppButton onClick={() => handleOpenWhatsApp()} />

      {/* WhatsApp Modal Dispatcher */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={handleCloseWhatsApp}
        initialSede={initialSedeForWhatsApp}
      />
    </div>
  );
}
