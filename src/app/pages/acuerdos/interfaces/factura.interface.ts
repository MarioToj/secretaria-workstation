import { Producto } from './producto.interface';

export interface Factura {
  id: string;
  dte: string;
  serie: string;
  numero: string;
  fecha: string;
  establecimiento: string;
  direccion: string;
  dueno: string;
  tratamientoDueno: 'del señor' | 'de la señora' | 'de';
  solicitantes: string;
  prefijoSolicitantes: 'de' | 'del' | 'de la' | 'los' | 'las';
  productos: Producto[];
  total: number;
  totalEnLetras: string;
  conceptoDetallado: string;
}
