import { useState, useMemo } from 'react';
import { Search, MapPin, Phone, MessageSquare, Clock, Coffee, Moon, Navigation } from 'lucide-react';
import { SEDES_DATA, type Sede } from '../data/sedesData';
import { assetPath } from '../utils/assetPath';

interface SedesSectionProps {
  onSelectSedeForWhatsApp: (sede: Sede) => void;
}

export function SedesSection({ onSelectSedeForWhatsApp }: SedesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [filter24Hours, setFilter24Hours] = useState(false);
  const [filterCafeteria, setFilterCafeteria] = useState(false);

  const cities = ['Todas', 'Cúcuta', 'Los Patios', 'Chinácota', 'Villa del Rosario'];

  const filteredSedes = useMemo(() => {
    return SEDES_DATA.filter((sede) => {
      const matchesSearch =
        sede.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sede.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sede.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = selectedCity === 'Todas' || sede.city === selectedCity;
      const matches24h = !filter24Hours || sede.is24Hours;
      const matchesCafeteria = !filterCafeteria || sede.hasCafeteria;

      return matchesSearch && matchesCity && matches24h && matchesCafeteria;
    });
  }, [searchTerm, selectedCity, filter24Hours, filterCafeteria]);

  return (
    <section id="sedes" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-200 text-lime-900 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Nuestra Red en Norte de Santander
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Encuentra tu Supermercado Betel más cercano
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Estamos presentes en 10 puntos estratégicos de Cúcuta, Los Patios y Chinácota con servicio de calidad, ventanilla nocturna y atención personalizada.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-6 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por sede, barrio o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none text-sm font-medium transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* City Tabs */}
            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-md shadow-lime-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {city} {city === 'Todas' && `(${SEDES_DATA.length})`}
                </button>
              ))}

              <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

              {/* Toggle Filters */}
              <button
                onClick={() => setFilter24Hours(!filter24Hours)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filter24Hours
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>24H / Ventanilla</span>
              </button>

              <button
                onClick={() => setFilterCafeteria(!filterCafeteria)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filterCafeteria
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Con Cafetería</span>
              </button>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-sm text-slate-500 font-medium px-1">
          <span>Mostrando {filteredSedes.length} de {SEDES_DATA.length} sedes</span>
          {(searchTerm || selectedCity !== 'Todas' || filter24Hours || filterCafeteria) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('Todas');
                setFilter24Hours(false);
                setFilterCafeteria(false);
              }}
              className="text-orange-600 hover:text-orange-700 hover:underline text-xs font-bold cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Sedes Grid */}
        {filteredSedes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSedes.map((sede) => (
              <div
                key={sede.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/90 transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Sede Image with Badges */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                  <img
                    src={sede.image}
                    alt={`Supermercado Betel ${sede.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = assetPath('/images/banner-nosotros.jpg');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm">
                      {sede.city}
                    </span>
                    {sede.is24Hours && (
                      <span className="px-2.5 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <Moon className="w-3 h-3 text-white" />
                        24 Horas
                      </span>
                    )}
                  </div>

                  {sede.hasCafeteria && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <Coffee className="w-3 h-3" />
                        Cafetería
                      </span>
                    </div>
                  )}

                  {/* Sede Name on Image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-black text-white drop-shadow-sm tracking-tight">
                      {sede.name}
                    </h3>
                  </div>
                </div>

                {/* Sede Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-6">
                    {/* Address */}
                    <div className="flex items-start gap-2.5 text-slate-600 text-sm">
                      <MapPin className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{sede.address}</span>
                    </div>

                    {/* Opening Hours */}
                    <div className="flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">{sede.hours}</div>
                        {sede.nightService && (
                          <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            <span>{sede.nightService}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone / Line */}
                    <div className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-sm">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a
                        href={`tel:${sede.phone}`}
                        className="font-semibold text-slate-800 hover:text-orange-600 hover:underline"
                      >
                        {sede.phone}
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => onSelectSedeForWhatsApp(sede)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede.mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                      title="Ver ubicación en Google Maps"
                    >
                      <Navigation className="w-4 h-4 text-lime-700" />
                      <span className="hidden sm:inline">Mapa</span>
                    </a>

                    <a
                      href={`tel:${sede.phone}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors sm:hidden"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Llamar</span>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800 mb-1">No se encontraron sedes</h4>
            <p className="text-sm text-slate-500 mb-4">
              Prueba con otro término de búsqueda o limpia los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('Todas');
                setFilter24Hours(false);
                setFilterCafeteria(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Ver todas las sedes
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
