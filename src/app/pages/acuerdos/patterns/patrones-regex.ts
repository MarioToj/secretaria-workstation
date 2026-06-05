/**
 * Expresiones regulares utilizadas para el análisis sintáctico de facturas y fechas en el servicio.
 */

// Expresión para detectar renglones de facturación tipo SAT FEL / Guatecompras
export const SAT_INVOICE_PRODUCT_REGEX = /\b\d+\s+(?:Servicio|Bien|B\/S)\s+(\d+)\s+([\s\S]+?)\s+([\d,]+\.\d{2})\s+(?:[\d,]+\.\d{2}\s+){0,2}([\d,]+\.\d{2})/gi;

// Expresión genérica de respaldo para detectar renglones de facturación estándar
export const GENERIC_INVOICE_PRODUCT_REGEX = /\b(\d+)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\/]+?)\s+Q?\.?\s*([\d,]+\.\d{2})\s+(?:[\d,]+\.\d{2}\s+){0,2}Q?\.?\s*([\d,]+\.\d{2})/g;

// Expresiones para análisis de fechas en formato largo y numérico
export const DATE_TEXT_MONTH_REGEX = /^(\d{1,2})[/-]([a-zñáéíóú]+)[/-](\d{4}|\d{2})$/i;
export const DATE_NUM_MONTH_REGEX = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})$/;

// Expresión para limpiar comas de montos numéricos
export const COMMA_GLOBAL_REGEX = /,/g;

// Expresión para eliminar puntos suspensivos o finales de descripciones
export const TRAILING_DOTS_REGEX = /\.+$/;


// Expresión para detectar palabras clave asociadas a personas jurídicas / empresas
export const COMPANY_KEYWORDS_REGEX = /\b(S\.?\s*A\.?|LTDA|LIMITADA|S\.?\s*C\.?|COOPERATIVA|CORP|CORPORATION|CORPORACION|CORPORACIÓN|INVERSIONES|ASOCIACION|ASOCIACIÓN|S\.?\s*A\.?\s*S\.?|COMPAÑIA|COMPAÑÍA|CIA\.?|GROUP|GRUPO|PRODUCCIONES|SERVICIOS|DISTRIBUIDORA|IMPORTADORA|COMERCIALIZADORA|CONSTRUCTORA)\b/i;

// Expresión para separar palabras por espacios en blanco repetidos
export const WHITE_SPACE_REGEX = /\s+/;

// Expresión para remover acentos y diacríticos (marcas Unicode)
export const ACCENTS_REGEX = /[\u0300-\u036f]/g;

// Expresión para buscar la sección <w:sectPr> en el XML de Word
export const SECT_PR_REGEX = /<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>/;

// Expresión regular mejorada para identificar incisos o números romanos/arábigos al inicio de líneas en acuerdos
export const LIST_ITEM_MARKER_REGEX = /^\s*(?:<strong>|<b>|<u>|<span[^>]*>)*([IVXLCDMivxlcdm]+|\d+)(?:\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)+\s*(?:\.|\))|\s*(?:\.|\))\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)*|(?:\.|\))\s*)\s*(.*)/;

