import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { determineOwnerGender, determineProductGender } from '../utils/gender.util';
import { numberToQuetzalesWords } from '../utils/number-to-words.util';

// Configurar el worker de PDF.js usando el archivo copiado en el directorio público con fallback dinámico
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs';
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}



export interface ExtractionPatterns {
  dte: string;
  serie: string;
  numero: string;
  fecha: string;
  establecimiento: string;
  direccion: string;
  dueno: string;
}

export interface Producto {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  genero: 'masculino' | 'femenino';
}

export interface Factura {
  id: string;
  dte: string;
  serie: string;
  numero: string;
  fecha: string;
  establecimiento: string;
  direccion: string;
  dueno: string;
  tratamientoDueno: 'del señor' | 'de la señora';
  solicitantes: string;
  productos: Producto[];
  total: number;
  totalEnLetras: string;
  conceptoDetallado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfParserService {

  // Patrones Regex por defecto (diseñados para Facturas FEL de SAT / Guatecompras en Guatemala)
  readonly defaultPatterns: ExtractionPatterns = {
    dte: '(?:Número de DTE|DTE|Autorización|UUID):?\\s*([0-9a-fA-F\\-]{8,36}|[0-9]+)',
    serie: '(?:SERIE|Serie):?\\s*([0-9A-Z]+)',
    numero: '(?:NÚMERO|Número|No\\.):?\\s*([0-9]+)',
    fecha: '(?:Fecha de emisi[oó]n|Fecha y hora de emisi[oó]n|Fecha|Emisi[oó]n):?\\s*([0-9]{1,2}[/-][a-zA-ZáéíóúÁÉÍÓÚ]+[/-][0-9]{2,4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\\s+de\\s+[a-zA-ZáéíóúÁÉÍÓÚ]+\\s+de\\s+[0-9]{4})',
    establecimiento: '(?:(?:[0-9a-fA-F\\-]{36})?\\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.\\&\\/\\,\\"\\\'«»“”‘’]{3,50})(?=\\s*Serie:)|(?:Nombre Comercial|Establecimiento|Nombre del Emisor|Emisor):?\\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.\\&\\/\\,\\"\\\'«»“”‘’]{3,50})(?=\\s*(?:Serie:|Dirección:|NIT:|Receptor:|$)))',
    direccion: '(?:Dirección del Establecimiento|Dirección Comercial|Dirección|Ubicado en):\\s*([0-9a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.,/]+?)(?=\\s*(?:Numero Acceso|NIT|Receptor|Fecha|Moneda|$))|\\b[0-9]{10}\\s+([0-9a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.,/]{10,100})(?=\\s*Numero Acceso)',
    dueno: '(?:Propietario|Dueño|Nombre del Propietario|Representante Legal|Nombre del Emisor|Nombre Emisor|Razon Social|Razón Social|Emisor|Contribuyente):?\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\,\\.]{3,60})(?=\\s*(?:Serie:|Dirección:|NIT:|Receptor:|$))|(?:Factura[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*\\s+\\d+\\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\,\\.]{3,60})(?=\\s+NÚMERO DE AUTORIZACIÓN)'
  };

  /**
   * Extrae el texto plano de un archivo PDF (Blob/File).
   */
  async extractText(file: File): Promise<string> {
    try {
      let arrayBuffer: ArrayBuffer;
      if (typeof file.arrayBuffer === 'function') {
        try {
          arrayBuffer = await file.arrayBuffer();
        } catch (e) {
          arrayBuffer = await this.readAsArrayBuffer(file);
        }
      } else {
        arrayBuffer = await this.readAsArrayBuffer(file);
      }

      let pdf;
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
      } catch (workerError) {
        console.warn('Fallo al inicializar el Web Worker de PDF.js, intentando con Fake Worker...', workerError);
        // Intentar con el fake worker (sin workerSrc) para entornos móviles/HTTP locales restrictivos
        const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        try {
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          pdf = await loadingTask.promise;
        } catch (fallbackError) {
          // Restablecer por si acaso y lanzar el error original
          pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
          throw fallbackError;
        }
      }

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Unir los fragmentos de texto en orden de lectura aproximado
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error al extraer texto del PDF con PDF.js:', error);
      throw new Error('No se pudo procesar el archivo PDF. Asegúrate de que no esté corrupto o protegido.');
    }
  }

  private readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Procesa el texto plano de una factura utilizando los patrones Regex configurados
   * y devuelve un objeto estructurado Factura.
   */
  parseInvoice(text: string, patterns: ExtractionPatterns = this.defaultPatterns): Factura {
    const dte = this.matchPattern(text, patterns.dte);
    const serie = this.matchPattern(text, patterns.serie);
    const numero = this.matchPattern(text, patterns.numero);
    const fecha = this.matchPattern(text, patterns.fecha);
    const fechaFormateada = this.formatDateToSpanishLong(fecha);
    const establecimiento = this.matchPattern(text, patterns.establecimiento);
    const direccion = this.matchPattern(text, patterns.direccion);
    const dueno = this.matchPattern(text, patterns.dueno);

    // Deducir el género del dueño
    const tratamientoDueno = determineOwnerGender(dueno) === 'femenino' ? 'de la señora' : 'del señor';

    // Extracción heurística de la tabla de productos
    const productos = this.extractProductsHeuristic(text);
    const total = productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
    const totalEnLetras = numberToQuetzalesWords(total, { uppercase: true });
    
    // Autogenerar el concepto detallado
    const conceptoDetallado = this.generateConceptDetail(productos);

    return {
      id: Math.random().toString(36).substring(2, 9),
      dte: dte || 'DTE NO ENCONTRADO',
      serie: serie || 'SERIE NO ENCONTRADA',
      numero: numero || 'NUMERO NO ENCONTRADO',
      fecha: fechaFormateada || 'FECHA NO ENCONTRADA',
      establecimiento: establecimiento || 'ESTABLECIMIENTO NO ENCONTRADO',
      direccion: direccion || 'DIRECCIÓN NO ENCONTRADA',
      dueno: dueno || 'PROPIETARIO NO ENCONTRADO',
      tratamientoDueno,
      solicitantes: '',
      productos,
      total,
      totalEnLetras,
      conceptoDetallado
    };
  }

  /**
   * Intenta extraer productos usando una heurística sobre líneas de texto
   * que parecen renglones de facturación (ej: "300 Sillas plásticas Q.75.00 Q.22,500.00")
   */
  private extractProductsHeuristic(text: string): Producto[] {
    const productos: Producto[] = [];
    const lines = text.split('\n');

    // 1. Regex específica para Guatecompras / SAT FEL:
    // [No] [Servicio/Bien] [Cantidad] [Descripción] [Precio Unitario] [Descuento] [Total]
    // Ejemplo: "1 Servicio 6 Vestuario y maquillaje... 1,800.00 0.00 10,800.00"
    const satRegex = /\b\d+\s+(?:Servicio|Bien|B\/S)\s+(\d+)\s+([\s\S]+?)\s+([\d,]+\.\d{2})\s+(?:[\d,]+\.\d{2}\s+)?([\d,]+\.\d{2})/gi;

    // 2. Regex genérica de respaldo:
    // [Cantidad] [Descripción] [Precio] [Total]
    const genericRegex = /\b(\d+)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\/]+?)\s+Q?\.?\s*([\d,]+\.\d{2})\s+Q?\.?\s*([\d,]+\.\d{2})/g;

    for (const line of lines) {
      let match;
      let matched = false;

      // Probar primero con la estructura SAT/Guatecompras
      satRegex.lastIndex = 0;
      while ((match = satRegex.exec(line)) !== null) {
        const cantidad = parseInt(match[1], 10);
        const descripcion = match[2].trim();
        const precioUnitario = parseFloat(match[3].replace(/,/g, ''));
        const subtotal = parseFloat(match[4].replace(/,/g, ''));

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
          const precioUnitario = parseFloat(match[3].replace(/,/g, ''));
          const subtotal = parseFloat(match[4].replace(/,/g, ''));

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
   * Ejecuta un patrón regex en un texto y retorna la primera captura o un string vacío.
   */
  private matchPattern(text: string, patternStr: string): string {
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
   * Genera el texto del concepto de los productos.
   * Ej: "300 sillas plásticas, con un valor de setenta y cinco quetzales (Q.75.00) cada una"
   */
  generateConceptDetail(productos: Producto[]): string {
    if (!productos || productos.length === 0) return '';
    
    return productos.map(p => {
      const precioLetras = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
      const generoLetras = p.genero === 'femenino' ? 'cada una' : 'cada uno';
      const formattedPrice = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      return `${p.cantidad} ${p.descripcion.toLowerCase()}, con un valor de ${precioLetras} (Q.${formattedPrice}) ${generoLetras}`;
    }).join(', ');
  }

  /**
   * Convierte fechas de formatos estándar (DD-MMM-YYYY o DD/MM/YYYY) a formato largo en español
   * (ej: "15-jul-2025" -> "15 de julio de 2025").
   */
  formatDateToSpanishLong(dateStr: string): string {
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
    const patternTextMonth = /^(\d{1,2})[/-]([a-zñáéíóú]+)[/-](\d{4}|\d{2})$/i;
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
    const patternNumMonth = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})$/;
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
}
