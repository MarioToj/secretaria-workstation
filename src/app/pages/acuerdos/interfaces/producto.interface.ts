import { ProductGender } from '../types/product-gender.type';

export interface Producto {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  genero: ProductGender;
}
