import { assetPath } from '../utils/assetPath';

export const COMPANY_DATA = {
  name: 'Supermercados Betel',
  shortName: 'Betel',
  tagline: '34 años al servicio de Norte de Santander',
  years: 34,
  generalPhone: '3154937743',
  whatsappMessage: '¡Hola Supermercados Betel! Me gustaría recibir información sobre promociones y domicilios.',
  socials: {
    facebook: 'https://web.facebook.com/supermercadobetel/?locale=es_LA',
    instagram: 'https://www.instagram.com/supermercadosbetel/',
    tiktok: 'https://www.tiktok.com/@supermercadosbetel',
    youtube: 'https://www.youtube.com/@SupermercadoBetel/videos'
  },
  mission: 'Satisfacer las necesidades de nuestros clientes, a través de nuestras unidades de negocio, con una oferta innovadora y versátil de productos de consumo masivo y tecnología; con altos niveles de calidad y servicio, generando gratas experiencias de compra para todos nuestros clientes a través de un equipo humano idóneo, capacitado y comprometido en brindar un servicio integral.',
  vision: 'Ser una empresa sólida, innovadora y versátil, líder regional en la comercialización de productos de consumo masivo, tecnología y marca propia, que generen calidad de vida a todos los clientes de su área de influencia.',
  values: [
    {
      title: 'Mejoramiento Continuo',
      desc: 'En pro de la excelencia constante en cada proceso y servicio.',
      icon: 'TrendingUp'
    },
    {
      title: 'Empatía',
      desc: 'Comprendemos y priorizamos las necesidades reales de nuestros clientes y sus familias.',
      icon: 'HeartHandshake'
    },
    {
      title: 'Competitividad',
      desc: 'Buscamos el liderazgo ofreciendo siempre los precios más justos y convenientes.',
      icon: 'Award'
    },
    {
      title: 'Integridad',
      desc: 'Transparencia, honestidad y rectitud en cada una de nuestras actuaciones.',
      icon: 'ShieldCheck'
    },
    {
      title: 'Respeto',
      desc: 'Hacia nuestros clientes, socios, colaboradores, comunidad y medio ambiente.',
      icon: 'Users'
    },
    {
      title: 'Compromiso y Responsabilidad',
      desc: 'Cumplir con dedicación y generar confianza duradera con quienes nos eligen día a día.',
      icon: 'CheckCircle2'
    }
  ],
  services: [
    {
      id: 'domicilios',
      title: 'Servicio a Domicilio',
      tagline: 'Rápido, seguro y directo a tu puerta',
      description: 'Pide tus productos favoritos de la canasta familiar cómodamente desde casa a través de WhatsApp o llamada directa a tu sede más cercana.',
      image: assetPath('/images/domicilios.png'),
      badge: 'Cobertura local'
    },
    {
      id: 'puntos',
      title: 'Puntos Betel',
      tagline: 'Tus compras siempre suman',
      description: 'Acumula puntos con cada compra en cualquiera de nuestras 10 sedes y redímelos por descuentos especiales o fabulosos premios para tu hogar.',
      image: assetPath('/images/puntos.png'),
      badge: 'Fidelización'
    },
    {
      id: 'botellon',
      title: 'Agua Purificada Betel',
      tagline: 'Hidratación pura para toda la familia',
      description: 'Botellones de agua con los más altos estándares de purificación y filtrado para garantizar salud y bienestar a un precio inigualable.',
      image: assetPath('/images/botellon.png'),
      badge: 'Marca Propia'
    },
    {
      id: 'nocturno',
      title: 'Servicio 24 Horas & Ventanilla',
      tagline: 'Siempre abiertos cuando nos necesitas',
      description: 'Contamos con sedes 24 horas y servicio por ventanilla nocturna para emergencias, antojos o compras imprevistas durante la madrugada.',
      image: assetPath('/images/sedes/PRADOS-DEL-ESTE.webp'),
      badge: '24/7 Disponible'
    }
  ],
  sustainability: {
    solarEnergy: {
      title: 'Paneles Solares & Energía Renovable',
      subtitle: 'Autogeneración 100% limpia',
      description: 'En Supermercados Betel trabajamos por un futuro más limpio implementando paneles solares en nuestras sedes. Generamos energía renovable, reduciendo significativamente la huella de carbono y evitando toneladas de emisiones de CO2 al año.'
    },
    circularEconomy: {
      title: 'Economía Circular & Impacto Social',
      subtitle: 'Transformamos el reciclaje en bienestar',
      description: 'Promovemos la economía circular dando una segunda vida útil a materiales como cartón, plásticos y reciclables. A través de este programa no solo cuidamos el planeta, sino que apoyamos a fundaciones y organizaciones sociales de Norte de Santander.'
    }
  },
  cafeteria: {
    title: 'Cafeterías Betel',
    subtitle: 'El mejor aroma, sabor y descanso en tu día',
    description: 'Nuestras cafeterías son el punto de encuentro ideal para disfrutar de desayunos típicos, café recién colado, exquisita panadería horneada a diario, jugos naturales y comidas rápidas preparadas con los más frescos ingredientes.',
    heroImage: assetPath('/images/cafeterias-hero.png'),
    features: [
      'Café especial colombiano recién preparado',
      'Panadería caliente y pastelería fresca horneada todos los días',
      'Desayunos completos, empanadas, pasteles y combos',
      'Espacios cómodos, climatizados y con atención de primera'
    ],
    branches: [
      { name: 'Prados del Este', hours: '6:00 AM – 7:00 PM', phone: '3154937743' },
      { name: 'La Floresta', hours: '7:00 AM – 8:00 PM', phone: '3165217810' },
      { name: 'Boconó', hours: 'Lun a Sáb: 7:00 AM – 7:00 PM | Dom: 8:00 AM – 3:00 PM', phone: '3168139076' },
      { name: 'Villa Mall', hours: '7:00 AM – 8:00 PM', phone: '3154937743' },
      { name: 'Chapinero', hours: '6:00 AM – 7:00 PM', phone: '3157712511' }
    ]
  }
};
