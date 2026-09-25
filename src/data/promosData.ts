export interface PromoDay {
  id: string;
  dayName: string;
  shortDay: string;
  title: string;
  description: string;
  badge: string;
  banner: string;
  highlights: string[];
}

export const PROMOS_DATA: PromoDay[] = [
  {
    id: 'lunes',
    dayName: 'Lunes',
    shortDay: 'LUN',
    title: 'Super Inicio de Semana',
    description: 'Comienza tu semana ahorrando al máximo en los productos esenciales de la canasta familiar.',
    badge: 'Descuentos Especiales',
    banner: '/images/promo-lunes.png',
    highlights: ['Frutas y verduras frescas del campo', 'Granos y abarrotes', 'Ahorro directo en caja']
  },
  {
    id: 'martes',
    dayName: 'Martes',
    shortDay: 'MAR',
    title: 'Martes de Campo & Frescura',
    description: 'La huerta llega directamente a tu mesa con la mejor selección agrícola de nuestra región.',
    badge: 'Cosecha Fresca',
    banner: '/images/promo-martes.png',
    highlights: ['Hortalizas y verduras seleccionadas', 'Frutas tropicales y de temporada', 'Calidad garantizada 100%']
  },
  {
    id: 'miercoles',
    dayName: 'Miércoles',
    shortDay: 'MIÉ',
    title: 'Miércoles de Ahorro Familiar',
    description: 'Mitad de semana con promociones imperdibles en marcas líderes para el hogar.',
    badge: 'Ofertas Familiares',
    banner: '/images/promo-miercoles.png',
    highlights: ['Lácteos, quesos y derivados', 'Panadería y pasabocas', 'Bebidas e hidratación']
  },
  {
    id: 'jueves',
    dayName: 'Jueves',
    shortDay: 'JUE',
    title: 'Jueves de Carnes & Proteínas',
    description: 'Cortes premium de res, cerdo, pollo y pescados con la máxima higiene y frescura certificada.',
    badge: 'Carnicería Selecta',
    banner: '/images/promo-jueves.png',
    highlights: ['Cortes especiales de res y cerdo', 'Pollo fresco y embutidos', 'Pescados y mariscos']
  },
  {
    id: 'viernes',
    dayName: 'Viernes',
    shortDay: 'VIE',
    title: 'Viernes de Fiesta & Fin de Semana',
    description: 'Todo listo para el fin de semana con super ofertas en pasabocas, licores, aseo y despensa.',
    badge: 'Fin de Semana Betel',
    banner: '/images/promo-viernes.png',
    highlights: ['Snacks, bebidas y confitería', 'Línea completa de aseo para el hogar', 'Puntos dobles Betel']
  }
];
