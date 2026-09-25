import { assetPath } from '../utils/assetPath';

export interface Sede {
  id: string;
  name: string;
  city: 'Cúcuta' | 'Los Patios' | 'Chinácota' | 'Villa del Rosario';
  address: string;
  phone: string;
  hours: string;
  nightService?: string;
  hasCafeteria: boolean;
  is24Hours: boolean;
  image: string;
  mapQuery: string;
}

export const SEDES_DATA: Sede[] = [
  {
    id: 'prados-del-este',
    name: 'Prados del Este',
    city: 'Cúcuta',
    address: 'Av 8 #5-46, a 100mts del Puente la Gazapa',
    phone: '3154937743',
    hours: 'Puertas abiertas desde las 6:00 AM',
    nightService: 'Servicio 24 Horas continuo',
    hasCafeteria: true,
    is24Hours: true,
    image: assetPath('/images/sedes/PRADOS-DEL-ESTE.webp'),
    mapQuery: 'Supermercado Betel Prados del Este Cucuta'
  },
  {
    id: 'la-floresta',
    name: 'La Floresta',
    city: 'Cúcuta',
    address: 'Urb. Terrazas de la Floresta – Lotes 1BC & 1B',
    phone: '3165217810',
    hours: '7:00 AM a 9:00 PM',
    nightService: 'Ventanilla nocturna: 9:00 PM a 7:00 AM',
    hasCafeteria: true,
    is24Hours: true,
    image: assetPath('/images/sedes/LA-FLORESTA.webp'),
    mapQuery: 'Supermercado Betel La Floresta Cucuta'
  },
  {
    id: 'bocono',
    name: 'Boconó',
    city: 'Cúcuta',
    address: 'Vía Boconó Local No 3, Conjunto el Lago',
    phone: '3168139076',
    hours: '7:00 AM a 12:00 AM',
    nightService: 'Ventanilla nocturna: 12:00 AM a 7:00 AM',
    hasCafeteria: true,
    is24Hours: true,
    image: assetPath('/images/sedes/BOCONO.webp'),
    mapQuery: 'Supermercado Betel Bocono Cucuta'
  },
  {
    id: 'ceiba-2',
    name: 'Ceiba 2',
    city: 'Cúcuta',
    address: 'Av 3N #7 AN-05',
    phone: '3174024476',
    hours: '6:30 AM a 9:00 PM',
    nightService: undefined,
    hasCafeteria: false,
    is24Hours: false,
    image: assetPath('/images/sedes/CEIBA-2.webp'),
    mapQuery: 'Supermercado Betel Ceiba 2 Cucuta'
  },
  {
    id: 'villa-mall',
    name: 'Villa Mall',
    city: 'Villa del Rosario',
    address: 'Vía Autopista Internacional, junto a la parroquia Divino Niño Jesús',
    phone: '3154937743',
    hours: '7:00 AM a 9:00 PM',
    nightService: undefined,
    hasCafeteria: true,
    is24Hours: false,
    image: assetPath('/images/sedes/Villamall.jpeg'),
    mapQuery: 'Supermercado Betel Villa Mall Autopista Internacional'
  },
  {
    id: 'san-rafael',
    name: 'San Rafael',
    city: 'Cúcuta',
    address: 'Av 1 #25-43 – Junto a la Iglesia San Rafael',
    phone: '3162278888',
    hours: '6:00 AM a 9:00 PM',
    nightService: 'Ventanilla nocturna: 9:00 PM a 6:00 AM',
    hasCafeteria: false,
    is24Hours: true,
    image: assetPath('/images/sedes/SAN-RAFAEL.webp'),
    mapQuery: 'Supermercado Betel San Rafael Cucuta'
  },
  {
    id: 'el-contento',
    name: 'El Contento',
    city: 'Cúcuta',
    address: 'Av 12 con Cll 12 #11, Barrio El Contento',
    phone: '3112179281',
    hours: '6:30 AM a 8:30 PM',
    nightService: 'Ventanilla nocturna: 8:30 PM a 6:30 AM',
    hasCafeteria: false,
    is24Hours: true,
    image: assetPath('/images/sedes/EL-CONTENTO.webp'),
    mapQuery: 'Supermercado Betel El Contento Cucuta'
  },
  {
    id: 'chapinero',
    name: 'Chapinero',
    city: 'Cúcuta',
    address: 'Calle 1 #1-89 – Barrio Chapinero',
    phone: '3157712511',
    hours: '6:00 AM a 8:00 PM',
    nightService: 'Ventanilla nocturna: 8:00 PM a 6:00 AM',
    hasCafeteria: true,
    is24Hours: true,
    image: assetPath('/images/sedes/CHAPINERO.webp'),
    mapQuery: 'Supermercado Betel Chapinero Cucuta'
  },
  {
    id: 'chinacota',
    name: 'Chinácota',
    city: 'Chinácota',
    address: 'Manzana A - Lote 4, Conjunto Campestre San Cristóbal',
    phone: '3165265198',
    hours: '7:30 AM a 9:00 PM',
    nightService: 'Viernes, Sábados y Domingos: 9:00 PM a 7:30 AM',
    hasCafeteria: false,
    is24Hours: false,
    image: assetPath('/images/sedes/CHINACOTA.webp'),
    mapQuery: 'Supermercado Betel Chinacota'
  },
  {
    id: 'los-patios',
    name: 'Los Patios',
    city: 'Los Patios',
    address: 'Av 10 Cll 19 #18-49 – Once de Noviembre',
    phone: '3176797052',
    hours: '6:30 AM a 9:00 PM',
    nightService: 'Ventanilla nocturna: 9:00 PM a 7:00 AM',
    hasCafeteria: false,
    is24Hours: true,
    image: assetPath('/images/sedes/LOS-PATIOS.webp'),
    mapQuery: 'Supermercado Betel Los Patios Cucuta'
  }
];
