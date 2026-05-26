/**
 * Utilidades para la determinación y concordancia de género en español.
 */

// Lista de nombres femeninos comunes que no terminan en 'a'
const FEMALE_NAMES_EXCEPTIONS = new Set([
  'BEATRIZ', 'CARMEN', 'ISABEL', 'INES', 'INÉS', 'MERCEDES', 'PILAR', 'RAQUEL', 
  'RUTH', 'ESTHER', 'ABIGAIL', 'BELEN', 'BELÉN', 'MIRIAM', 'CONSUELO', 'DOLORES', 
  'ROCIO', 'ROCÍO', 'ROSARIO', 'LUZ', 'CONCEPCION', 'CONCEPCIÓN', 'SOCORRO'
]);

// Lista de nombres masculinos comunes que terminan en 'a'
const MALE_NAMES_EXCEPTIONS = new Set([
  'LUCA', 'MATIA', 'SANTIAGO', 'JOAQUIN', 'JOAQUÍN' // En Guatemala "Andrea" es femenino
]);

/**
 * Determina heurísticamente el género de un nombre de persona en español.
 * Devuelve 'masculino' o 'femenino'.
 */
export function determineOwnerGender(fullName: string): 'masculino' | 'femenino' | 'empresa' {
  if (!fullName) return 'masculino';

  const cleanName = fullName.trim().toUpperCase();

  // Detectar si es una empresa / sociedad anónima / cooperativa / etc.
  const companyKeywords = /\b(S\.?\s*A\.?|LTDA|LIMITADA|S\.?\s*C\.?|COOPERATIVA|CORP|CORPORATION|CORPORACION|CORPORACIÓN|INVERSIONES|ASOCIACION|ASOCIACIÓN|S\.?\s*A\.?\s*S\.?|COMPAÑIA|COMPAÑÍA|CIA\.?|GROUP|GRUPO|PRODUCCIONES|SERVICIOS|DISTRIBUIDORA|IMPORTADORA|COMERCIALIZADORA|CONSTRUCTORA)\b/i;
  
  if (companyKeywords.test(cleanName)) {
    return 'empresa';
  }
  const parts = cleanName.split(/\s+/);
  let firstName = parts[0];

  // Si el primer nombre es compuesto común (como "JUAN CARLOS", "MARÍA JOSÉ"), 
  // revisamos si tiene un segundo nombre que defina mejor el género
  if ((firstName === 'MARIA' || firstName === 'MARÍAS' || firstName === 'MARIA' || firstName === 'MA.') && parts.length > 1) {
    // Si empieza con María pero tiene otro nombre, usualmente se define por el segundo
    // ej. "Maria Jose" puede ser femenino, "Jose Maria" suele ser masculino
    if (parts[1] === 'JOSE' || parts[1] === 'JOSÉ') {
      // "Maria Jose" sigue siendo femenino en Guatemala generalmente
      return 'femenino';
    }
  }

  // Quitar acentos para comparar mejor
  const normalized = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (FEMALE_NAMES_EXCEPTIONS.has(normalized) || FEMALE_NAMES_EXCEPTIONS.has(firstName)) {
    return 'femenino';
  }

  if (MALE_NAMES_EXCEPTIONS.has(normalized) || MALE_NAMES_EXCEPTIONS.has(firstName)) {
    return 'masculino';
  }

  // Heurística básica: nombres terminados en 'A' son femeninos
  if (normalized.endsWith('A')) {
    return 'femenino';
  }

  // Por defecto, asumimos masculino
  return 'masculino';
}

// Diccionario de palabras comunes femeninas en administración pública y adquisiciones
const FEMININE_NOUNS = new Set([
  'SILLA', 'MESA', 'COMPUTADORA', 'IMPRESORA', 'CARPETA', 'LICENCIA', 'HOJA', 
  'BATERIA', 'BATERÍA', 'GRAPA', 'TINTA', 'PANTALLA', 'BOMBA', 'PINTURA', 
  'LAMINA', 'LÁMINA', 'REFACCION', 'REFACCIÓN', 'REPARACION', 'REPARACIÓN', 
  'CONSTRUCCION', 'CONSTRUCCIÓN', 'CONSULTORIA', 'CONSULTORÍA', 'ASESORIA', 
  'ASESORÍA', 'CAPACITACION', 'CAPACITACIÓN', 'ADQUISICION', 'ADQUISICIÓN', 
  'LIMPIEZA', 'LLANTA', 'VENTANA', 'PUERTA', 'MOCHILA', 'BOLSA', 'ESCOBA',
  'AGUA', 'BEBIDA', 'CAMA', 'MEDICINA', 'VACUNA', 'CONTRATACION', 'CONTRATACIÓN'
]);

// Diccionario de palabras comunes masculinas
const MASCULINE_NOUNS = new Set([
  'ESCRITORIO', 'ARCHIVADOR', 'PAPEL', 'CUADERNO', 'LAPICERO', 'BOLIGRAFO', 
  'BOLÍGRAFO', 'LAPIZ', 'LÁPIZ', 'TECLADO', 'MOUSE', 'MONITOR', 'CABLE', 
  'SERVICIO', 'MANTENIMIENTO', 'EQUIPO', 'INSUMO', 'MATERIAL', 'MEDICAMENTO', 
  'ALIMENTO', 'ALMUERZO', 'TRANSPORTE', 'FLETE', 'COMBUSTIBLE', 'ARRENDAMIENTO', 
  'PAGO', 'TEXTO', 'LIBRO', 'PUNTO', 'COCHE', 'VEHICULO', 'VEHÍCULO', 'PROYECTO'
]);

/**
 * Determina heurísticamente el género de un producto/servicio en base a su descripción
 * para concordar con "cada uno" (masculino) o "cada una" (femenino).
 */
export function determineProductGender(description: string): 'masculino' | 'femenino' {
  if (!description) return 'masculino';

  // Limpiar y obtener la primera palabra significativa (descartando artículos/preposiciones si las hay)
  const cleanText = description.trim().toUpperCase();
  const words = cleanText.split(/\s+/).filter(w => w.length > 2); // Palabras de más de 2 caracteres
  
  if (words.length === 0) return 'masculino';

  let firstNoun = words[0];
  
  // Si la primera palabra es un artículo (el, la, los, las, un, una, unos, unas), pasamos a la siguiente
  const articles = new Set(['EL', 'LA', 'LOS', 'LAS', 'UN', 'UNA', 'UNOS', 'UNAS', 'DE', 'DEL', 'PARA']);
  if (articles.has(firstNoun) && words.length > 1) {
    firstNoun = words[1];
  }

  // Quitar el plural simple (s o es al final) para analizar la raíz
  let singularNoun = firstNoun;
  if (singularNoun.endsWith('ES') && singularNoun.length > 3) {
    singularNoun = singularNoun.slice(0, -2);
  } else if (singularNoun.endsWith('S') && !singularNoun.endsWith('IS') && !singularNoun.endsWith('US') && singularNoun.length > 2) {
    singularNoun = singularNoun.slice(0, -1);
  }

  // Quitar acentos
  const normalizedSingular = singularNoun.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Buscar en diccionario explícito
  if (FEMININE_NOUNS.has(normalizedSingular) || FEMININE_NOUNS.has(singularNoun) || FEMININE_NOUNS.has(firstNoun)) {
    return 'femenino';
  }
  if (MASCULINE_NOUNS.has(normalizedSingular) || MASCULINE_NOUNS.has(singularNoun) || MASCULINE_NOUNS.has(firstNoun)) {
    return 'masculino';
  }

  // 2. Reglas de terminación en español
  // Femeninos: terminan en -A, -CION, -SION, -TAD, -DAD, -TUD
  if (normalizedSingular.endsWith('A') || 
      normalizedSingular.endsWith('CION') || 
      normalizedSingular.endsWith('SION') || 
      normalizedSingular.endsWith('DAD') || 
      normalizedSingular.endsWith('TAD') || 
      normalizedSingular.endsWith('TUD')) {
    return 'femenino';
  }

  // Por defecto, asumimos masculino ("cada uno")
  return 'masculino';
}
