import { Injectable } from '@angular/core';
import { determineGeneroPropietario } from '../utils/genero.util';
import { numberToQuetzalesWords } from '../../../shared/utils/words.util';
import { PatronesExtraccion } from '../interfaces/patrones-extraccion.interface';
import { Producto } from '../interfaces/producto.interface';
import { Factura } from '../interfaces/factura.interface';
import { DEFAULT_EXTRACTION_PATTERNS } from '../patterns/patrones-por-defecto';
import {
  matchPattern,
  extractProductsHeuristic,
  generateConceptDetail,
  formatDateToSpanishLong
} from '../utils/analizador-factura.util';

@Injectable({
  providedIn: 'root'
})
export class AnalizadorFacturaService {

  // Patrones por defecto
  readonly defaultPatterns: PatronesExtraccion = DEFAULT_EXTRACTION_PATTERNS;

  /**
   * Procesa el texto plano de una factura utilizando los patrones Regex configurados
   * y devuelve un objeto estructurado Factura.
   */
  parseInvoice(text: string, patterns: PatronesExtraccion = this.defaultPatterns): Factura {
    const dte = matchPattern(text, patterns.dte);
    const serie = matchPattern(text, patterns.serie);
    const numero = matchPattern(text, patterns.numero);
    const fecha = matchPattern(text, patterns.fecha);
    const fechaFormateada = formatDateToSpanishLong(fecha);
    const establecimiento = matchPattern(text, patterns.establecimiento);
    const direccion = matchPattern(text, patterns.direccion);
    const dueno = matchPattern(text, patterns.dueno);

    // Deducir el género del dueño o si es una empresa/sociedad
    const gender = determineGeneroPropietario(dueno);
    const tratamientoDueno = gender === 'empresa' ? 'de' : (gender === 'femenino' ? 'de la señora' : 'del señor');

    // Extracción heurística de la tabla de productos
    const productos = extractProductsHeuristic(text);
    const total = productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
    const totalEnLetras = numberToQuetzalesWords(total, { uppercase: true });
    
    // Autogenerar el concepto detallado
    const conceptoDetallado = generateConceptDetail(productos);

    return {
      id: Math.random().toString(36).substring(2, 9),
      dte: dte || 'DTE NO ENCONTRADO',
      serie: serie || 'SERIE NO ENCONTRADA',
      numero: numero || dte || 'NUMERO NO ENCONTRADO',
      fecha: fechaFormateada || 'FECHA NO ENCONTRADA',
      establecimiento: establecimiento || 'ESTABLECIMIENTO NO ENCONTRADO',
      direccion: direccion || 'DIRECCIÓN NO ENCONTRADA',
      dueno: dueno || 'PROPIETARIO NO ENCONTRADO',
      tratamientoDueno,
      solicitantes: '',
      prefijoSolicitantes: 'de',
      productos,
      total,
      totalEnLetras,
      conceptoDetallado
    };
  }

  /**
   * Genera el texto del concepto de los productos.
   * Ej: "300 sillas plásticas, con un valor de setenta y cinco quetzales (Q.75.00) cada una"
   */
  generateConceptDetail(productos: Producto[]): string {
    return generateConceptDetail(productos);
  }

  /**
   * Convierte fechas de formatos estándar (DD-MMM-YYYY o DD/MM/YYYY) a formato largo en español
   * (ej: "15-jul-2025" -> "15 de julio de 2025").
   */
  formatDateToSpanishLong(dateStr: string): string {
    return formatDateToSpanishLong(dateStr);
  }
}
