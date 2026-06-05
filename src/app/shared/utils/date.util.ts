import { enteroALetras } from './words.util';

const DATE_PARSE_LONG_REGEX = /^(\d{1,2})\s+de\s+([a-zñáéíóú]+)\s+de\s+(\d{4})/i;
const DATE_PARSE_NUM_REGEX = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})/;

/**
 * Convierte una fecha en su representación escrita en español (para el acta de sesión).
 * Ejemplo: 19-Mar-2025 -> "diecinueve de marzo del año dos mil veinticinco"
 */
export function dateToSpanishWords(date: Date): string {
  const dia = date.getDate();
  const mesIndex = date.getMonth();
  const anio = date.getFullYear();

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  let diaLetras = enteroALetras(dia);
  if (dia === 1) {
    diaLetras = 'primero';
  }
  const mesNombre = meses[mesIndex];
  const anioLetras = enteroALetras(anio);

  return `${diaLetras} de ${mesNombre} del año ${anioLetras}`;
}

/**
 * Convierte una fecha en su representación escrita en mayúsculas para la certificación de compulsado.
 * Ejemplo: 24-Mar-2025 -> "VEINTICUATRO DÍAS DEL MES DE MARZO DEL AÑO DOS MIL VEINTICINCO"
 */
export function dateToSpanishCertDate(date: Date): string {
  const dia = date.getDate();
  const mesIndex = date.getMonth();
  const anio = date.getFullYear();

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  let diaLetras = enteroALetras(dia);
  if (dia === 1) {
    diaLetras = 'primer';
  }
  const mesNombre = meses[mesIndex].toUpperCase();
  const anioLetras = enteroALetras(anio).toUpperCase();

  return `${diaLetras.toUpperCase()} DÍAS DEL MES DE ${mesNombre} DEL AÑO ${anioLetras}`;
}

/**
 * Obtiene el miércoles más cercano que haya pasado (o sea hoy si hoy es miércoles).
 */
export function getClosestPastWednesday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mie, 4: Jue, 5: Vie, 6: Sab
  const diff = (day + 7 - 3) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Parsea una fecha escrita (texto) a su representación numérica en formato DD-MM-AAAA.
 */
export function parseDateToNumeric(dateStr: string): string {
  if (!dateStr) return '';
  const months: { [key: string]: string } = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };
  const clean = dateStr.toLowerCase().trim();
  const match = clean.match(DATE_PARSE_LONG_REGEX);
  if (match) {
    const d = match[1].padStart(2, '0');
    const m = months[match[2]];
    const y = match[3];
    if (m) return `${d}-${m}-${y}`;
  }
  const matchNum = clean.match(DATE_PARSE_NUM_REGEX);
  if (matchNum) {
    const d = matchNum[1].padStart(2, '0');
    const m = matchNum[2].padStart(2, '0');
    let y = matchNum[3];
    if (y.length === 2) y = '20' + y;
    return `${d}-${m}-${y}`;
  }
  return dateStr;
}
