/**
 * Utilidad para convertir números en su representación escrita en español (para Quetzales).
 */

const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const ESPECIALES_10 = {
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve'
};
const ESPECIALES_20 = {
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veinticitre', // Se suele corregir en el flujo a veintisiete
  28: 'veintiocho',
  29: 'veintinueve'
};
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

/**
 * Convierte un grupo de tres dígitos a letras.
 */
function centenasALetras(num: number, esUnidadDeMillonOMil = false): string {
  if (num === 0) return '';
  if (num === 100) return 'cien';

  const c = Math.floor(num / 100);
  const r = num % 100;
  let result = CENTENAS[c];

  if (r > 0) {
    result += ' ' + decenasALetras(r, esUnidadDeMillonOMil);
  }
  return result.trim();
}

/**
 * Convierte un grupo de dos dígitos a letras.
 */
function decenasALetras(num: number, esUnidadDeMillonOMil = false): string {
  if (num === 0) return '';
  if (num < 10) {
    if (num === 1 && esUnidadDeMillonOMil) return 'un'; // "un mil", "un millón"
    return UNIDADES[num];
  }

  if (num === 10) return 'diez';
  if (num === 20) return 'veinte';

  if (num > 10 && num < 20) {
    return ESPECIALES_10[num as keyof typeof ESPECIALES_10] || '';
  }

  if (num > 20 && num < 30) {
    const res = ESPECIALES_20[num as keyof typeof ESPECIALES_20] || '';
    if (esUnidadDeMillonOMil && res.endsWith('uno')) {
      return res.slice(0, -1); // "veintiún mil" en vez de "veintiuno mil"
    }
    return res;
  }

  const d = Math.floor(num / 10);
  const u = num % 10;
  let result = DECENAS[d];

  if (u > 0) {
    const unidadStr = (u === 1 && esUnidadDeMillonOMil) ? 'un' : UNIDADES[u];
    result += ' y ' + unidadStr;
  }
  return result;
}

/**
 * Función principal para convertir un número entero positivo a palabras.
 */
export function enteroALetras(num: number): string {
  if (num === 0) return 'cero';
  if (num < 0) return 'menos ' + enteroALetras(Math.abs(num));

  let total = Math.floor(num);
  let partes: string[] = [];

  // Millones
  if (total >= 1000000) {
    const millones = Math.floor(total / 1000000);
    total = total % 1000000;
    if (millones === 1) {
      partes.push('un millón');
    } else {
      partes.push(centenasALetras(millones, true) + ' millones');
    }
  }

  // Miles
  if (total >= 1000) {
    const miles = Math.floor(total / 1000);
    total = total % 1000;
    if (miles === 1) {
      partes.push('mil');
    } else {
      partes.push(centenasALetras(miles, true) + ' mil');
    }
  }

  // Centenas/Unidades
  if (total > 0) {
    partes.push(centenasALetras(total, false));
  }

  return partes.join(' ').trim();
}

/**
 * Convierte un número decimal a formato de Quetzales en letras en español.
 * Ejemplos:
 * - 22500.00 -> "VEINTIDÓS MIL QUINIENTOS QUETZALES EXACTOS"
 * - 150.75 -> "CIENTO CINCUENTA QUETZALES CON SETENTA Y CINCO CENTAVOS"
 * - 75.00 (lowercase) -> "setenta y cinco quetzales"
 */
export function numberToQuetzalesWords(amount: number, options: { uppercase?: boolean; includeExact?: boolean } = {}): string {
  const uppercase = options.uppercase !== false;
  const includeExact = options.includeExact !== false;

  if (isNaN(amount) || amount === null) {
    return uppercase ? 'CERO QUETZALES' : 'cero quetzales';
  }

  const rounded = Math.round(amount * 100) / 100;
  const entero = Math.floor(rounded);
  const centavos = Math.round((rounded - entero) * 100);

  let letrasEntero = enteroALetras(entero);
  
  // Correcciones de redacción (ej: "un mil" -> "mil", "un millones" -> "un millón")
  // Ya están cubiertas en el flujo principal, pero hacemos ajustes ortográficos específicos:
  if (letrasEntero.startsWith('un mil')) {
    letrasEntero = letrasEntero.replace(/^un mil/, 'mil');
  }

  let finalStr = '';

  if (centavos === 0) {
    if (includeExact) {
      finalStr = `${letrasEntero} quetzales exactos`;
    } else {
      finalStr = `${letrasEntero} quetzales`;
    }
  } else {
    const letrasCentavos = enteroALetras(centavos);
    finalStr = `${letrasEntero} quetzales con ${letrasCentavos} centavos`;
  }

  // Capitalizar primera letra o poner todo en mayúsculas
  if (uppercase) {
    return finalStr.toUpperCase();
  } else {
    return finalStr.toLowerCase();
  }
}

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
