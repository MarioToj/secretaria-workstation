import { GeneroProducto } from '../types/genero-producto.type';

export interface Producto {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  genero: GeneroProducto;
}
