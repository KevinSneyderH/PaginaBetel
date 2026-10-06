import { useEffect, useState } from 'react';
import { Building2, Target, Eye, TrendingUp, HeartHandshake, Award, ShieldCheck, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { assetPath } from '../utils/assetPath';

type InformacionEmpresa = {
  id_informacion: number;
  tipo: string;
  titulo: string;
  contenido: string;
};

const ICONOS_VALORES = ['TrendingUp', 'HeartHandshake', 'Award', 'ShieldCheck', 'Users', 'CheckCircle2'];
export function AboutSection() {
  const [activeTab, setActiveTab] = useState<'quienes' | 'mision' | 'vision'>('quienes');
  const [informacionEmpresa, setInformacionEmpresa] = useState<InformacionEmpresa[] | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const controller = new AbortController();
    const url = new URL(supabaseUrl + '/rest/v1/informacion_empresa');
    url.searchParams.set('select', 'id_informacion,tipo,titulo,contenido');
    url.searchParams.set('activo', 'eq.true');
    url.searchParams.set('order', 'id_informacion.asc');

    fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
      },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('No fue posible cargar la información empresarial.');
        return response.json() as Promise<InformacionEmpresa[]>;
      })
      .then(setInformacionEmpresa)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error al cargar información empresarial:', error);
      });

    return () => controller.abort();
  }, []);

  const quienesSomos = informacionEmpresa?.find((item) => item.tipo === 'QUIENES_SOMOS');
  const quienesContenido = quienesSomos?.contenido ?? [
    'Somos una empresa Nortesantandereana, de origen familiar, fundada en 1992 con el propósito de servir y prestar la mejor atención a nuestros clientes, basados en la excelencia, respeto y el valor de cada persona.',
    'Estamos dedicados a la distribución de productos de la canasta familiar y comunicación celular.',
    'Entregamos a nuestros clientes servicios con altos criterios de calidad, garantizando los mejores precios.',
  ].join('\n\n');
  const mision = informacionEmpresa?.find((item) => item.tipo === 'MISION');
  const vision = informacionEmpresa?.find((item) => item.tipo === 'VISION');
  const valoresApi = informacionEmpresa?.filter((item) => item.tipo === 'VALORES') ?? [];
  const valoresCorporativos = valoresApi.length
    ? valoresApi.map((item, index) => ({
        id: item.id_informacion,
        title: item.titulo,
        desc: item.contenido,
        icon: ICONOS_VALORES[index % ICONOS_VALORES.length],
      }))
    : COMPANY_DATA.values.map((item, index) => ({
        ...item,
        id: 'fallback-' + index,
      }));

  const valueIcons: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="w-5 h-5 text-orange-500" />,
    HeartHandshake: <HeartHandshake className="w-5 h-5 text-lime-600" />,
    Award: <Award className="w-5 h-5 text-amber-500" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    Users: <Users className="w-5 h-5 text-orange-600" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5 text-lime-600" />,
  };

  return (
    <section id="nosotros" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-200 text-lime-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-lime-700" />
            Nuestra Historia & Compromiso
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Conócenos
          </h2>
        </div>

        {/* About, Mission & Vision Tabs Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Interactive Switcher */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab('quienes')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'quienes'
                      ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-md shadow-lime-600/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>¿Quiénes somos?</span>
                </button>
                <button
                  onClick={() => setActiveTab('mision')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'mision'
                      ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-md shadow-lime-600/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Nuestra Misión</span>
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'vision'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Nuestra Visión</span>
                </button>
              </div>

              <div className="min-h-[140px] flex items-center">
                {activeTab === 'quienes' ? (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-lime-600" />
                      ¿Quiénes Somos?
                    </h3>
                    <div className="space-y-3 text-slate-600 text-base leading-relaxed">
                      {quienesContenido.split(/\n\s*\n/).map((parrafo, index) => (
                        <p key={index}>{parrafo}</p>
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'mision' ? (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Target className="w-6 h-6 text-lime-600" />
                      Misión Institucional
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {mision?.contenido ?? COMPANY_DATA.mission}
                    </p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-orange-500" />
                      Visión Hacia el Futuro
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {vision?.contenido ?? COMPANY_DATA.vision}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
                <div className="p-3 rounded-2xl bg-lime-50/70 border border-lime-200">
                  <div className="text-2xl font-black text-lime-700">{COMPANY_DATA.years}+</div>
                  <div className="text-[11px] font-semibold text-slate-600">Años de servicio</div>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <div className="text-2xl font-black text-orange-600">10</div>
                  <div className="text-[11px] font-semibold text-slate-600">Sedes en la región</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-2xl font-black text-amber-600">100%</div>
                  <div className="text-[11px] font-semibold text-slate-600">Orgullo Regional</div>
                </div>
              </div>
            </div>

            {/* Right Column: Corporate Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100">
                <img
                  src={assetPath('/images/banner-nosotros.jpg')}
                  alt="Equipo Supermercados Betel"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Equipo humano capacitado
                    </div>
                    <div className="text-lg font-bold">Buenas experiencias</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Corporate Values */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 text-center mb-8">
            Nuestros Valores Corporativos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valoresCorporativos.map((val) => (
              <div
                key={val.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    {valueIcons[val.icon] || <CheckCircle2 className="w-5 h-5 text-lime-600" />}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{val.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}



