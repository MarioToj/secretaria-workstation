import { InspeccionEstado } from '../types/inspeccion-estado.type';

export interface Inspeccion {
  id: string;
  codigo: string;
  solicitante: string;
  motivo: string;
  fechaProgramada: string;
  inspector: string;
  estado: InspeccionEstado;
  direccion: string;
}
