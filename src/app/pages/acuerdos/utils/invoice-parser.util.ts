import { determineProductGender } from './gender.util';
import { numberToQuetzalesWords } from '../../../shared/utils/words.util';
import { Producto } from '../interfaces/producto.interface';
import {
  SAT_INVOICE_PRODUCT_REGEX,
  GENERIC_INVOICE_PRODUCT_REGEX,
  DATE_TEXT_MONTH_REGEX,
  DATE_NUM_MONTH_REGEX,
  COMMA_GLOBAL_REGEX,
  TRAILING_DOTS_REGEX
} from '../patterns/regex-patterns';

/**
 * Ejecuta un patrón regex en un texto y retorna la primera captura o un string vacío.
 */
export function matchPattern(text: string, patternStr: string): string {
  if (!patternStr) return '';
  try {
    const regex = new RegExp(patternStr, 'i');
    const match = text.match(regex);
    if (match) {
      for (let i = 1; i < match.length; i++) {
        if (match[i]) return match[i].trim();
      }
    }
    return '';
  } catch (e) {
    console.error('Error al aplicar regex:', patternStr, e);
    return '';
  }
}

/**
 * Intenta extraer productos usando una heurística sobre líneas de texto
 * que parecen renglones de facturación (ej: "300 Sillas plásticas Q.75.00 Q.22,500.00")
 */
export function extractProductsHeuristic(text: string): Producto[] {
  const productos: Producto[] = [];
  const lines = text.split('\n');

  // Regex específica para Guatecompras / SAT FEL:
  const satRegex = SAT_INVOICE_PRODUCT_REGEX;

  // Regex genérica de respaldo:
  const genericRegex = GENERIC_INVOICE_PRODUCT_REGEX;

  for (const line of lines) {
    let match;
    let matched = false;

    // Probar primero con la estructura SAT/Guatecompras
    satRegex.lastIndex = 0;
    while ((match = satRegex.exec(line)) !== null) {
      const cantidad = parseInt(match[1], 10);
      const descripcion = match[2].trim();
      const precioUnitario = parseFloat(match[3].replace(COMMA_GLOBAL_REGEX, ''));
      const subtotal = parseFloat(match[4].replace(COMMA_GLOBAL_REGEX, ''));

      // Validar coherencia matemática
      if (cantidad > 0 && precioUnitario > 0 && Math.abs((cantidad * precioUnitario) - subtotal) < 2) {
        productos.push({
          cantidad,
          descripcion,
          precioUnitario,
          genero: determineProductGender(descripcion)
        });
        matched = true;
      }
    }

    // Si no coincidió con el formato SAT en esta línea, probar el genérico
    if (!matched) {
      genericRegex.lastIndex = 0;
      while ((match = genericRegex.exec(line)) !== null) {
        const cantidad = parseInt(match[1], 10);
        const descripcion = match[2].trim();
        const precioUnitario = parseFloat(match[3].replace(COMMA_GLOBAL_REGEX, ''));
        const subtotal = parseFloat(match[4].replace(COMMA_GLOBAL_REGEX, ''));

        if (cantidad > 0 && precioUnitario > 0 && Math.abs((cantidad * precioUnitario) - subtotal) < 2) {
          productos.push({
            cantidad,
            descripcion,
            precioUnitario,
            genero: determineProductGender(descripcion)
          });
        }
      }
    }
  }

  // Si la heurística no encontró nada, agregamos un producto genérico vacío para que el usuario lo edite
  if (productos.length === 0) {
    productos.push({
      cantidad: 1,
      descripcion: 'Servicio/Producto General',
      precioUnitario: 0,
      genero: 'masculino'
    });
  }

  return productos;
}

/**
 * Genera el texto del concepto de los productos.
 * Ej: "300 sillas plásticas, con un valor de setenta y cinco quetzales (Q.75.00) cada una"
 */
export function generateConceptDetail(productos: Producto[]): string {
  if (!productos || productos.length === 0) return '';
  
  return productos.map(p => {
    const precioLetras = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
    const cleanDesc = p.descripcion.trim().replace(TRAILING_DOTS_REGEX, '');
    const generoLetras = p.cantidad === 1 ? '' : (p.genero === 'femenino' ? ' cada una' : ' cada uno');
    const formattedPrice = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return `${p.cantidad} ${cleanDesc}, con un valor de ${precioLetras} (Q.${formattedPrice})${generoLetras}`;
  }).join(', ');
}

/**
 * Convierte fechas de formatos estándar (DD-MMM-YYYY o DD/MM/YYYY) a formato largo en español
 * (ej: "15-jul-2025" -> "15 de julio de 2025").
 */
export function formatDateToSpanishLong(dateStr: string): string {
  if (!dateStr) return '';
  
  const cleanStr = dateStr.trim().toLowerCase();
  
  const meses: { [key: string]: string } = {
    '01': 'enero', '1': 'enero', 'ene': 'enero', 'enero': 'enero', 'jan': 'enero',
    '02': 'febrero', '2': 'febrero', 'feb': 'febrero', 'febrero': 'febrero',
    '03': 'marzo', '3': 'marzo', 'mar': 'marzo', 'marzo': 'marzo',
    '04': 'abril', '4': 'abril', 'abr': 'abril', 'abril': 'abril', 'apr': 'abril',
    '05': 'mayo', '5': 'mayo', 'may': 'mayo', 'mayo': 'mayo',
    '06': 'junio', '6': 'junio', 'jun': 'junio', 'junio': 'junio',
    '07': 'julio', '7': 'julio', 'jul': 'julio', 'julio': 'julio',
    '08': 'agosto', '8': 'agosto', 'ago': 'agosto', 'agosto': 'agosto', 'aug': 'agosto',
    '09': 'septiembre', '9': 'septiembre', 'sep': 'septiembre', 'septiembre': 'septiembre',
    '10': 'octubre', 'oct': 'octubre', 'octubre': 'octubre',
    '11': 'noviembre', 'nov': 'noviembre', 'noviembre': 'noviembre',
    '12': 'diciembre', 'dic': 'diciembre', 'diciembre': 'diciembre', 'dec': 'diciembre'
  };

  // Caso 1: Formato DD-MMM-YYYY (ej. 15-jul-2025 o 15/jul/2025)
  const patternTextMonth = DATE_TEXT_MONTH_REGEX;
  let match = cleanStr.match(patternTextMonth);
  if (match) {
    let dia = match[1];
    if (dia.startsWith('0') && dia.length > 1) {
      dia = dia.substring(1);
    }
    const mesAbbr = match[2];
    let anio = match[3];
    if (anio.length === 2) anio = '20' + anio;
    
    const mesNombre = meses[mesAbbr];
    if (mesNombre) {
      return `${dia} de ${mesNombre} de ${anio}`;
    }
  }

  // Caso 2: Formato DD-MM-YYYY (ej. 15-07-2025 o 15/07/2025)
  const patternNumMonth = DATE_NUM_MONTH_REGEX;
  match = cleanStr.match(patternNumMonth);
  if (match) {
    let dia = match[1];
    if (dia.startsWith('0') && dia.length > 1) {
      dia = dia.substring(1);
    }
    const mesNum = match[2];
    let anio = match[3];
    if (anio.length === 2) anio = '20' + anio;

    const mesNombre = meses[mesNum];
    if (mesNombre) {
      return `${dia} de ${mesNombre} de ${anio}`;
    }
  }

  return dateStr;
}
