import * as pdfjsLib from 'pdfjs-dist';

// Polyfill para Promise.withResolvers para navegadores móviles antiguos (iOS < 17.4, Chrome/Safari antiguos)
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Polyfill para ReadableStream async iterator (requerido para getTextContent() en Safari móvil)
if (typeof ReadableStream !== 'undefined' && !(ReadableStream.prototype as any)[Symbol.asyncIterator]) {
  (ReadableStream.prototype as any)[Symbol.asyncIterator] = async function* (this: ReadableStream) {
    const reader = this.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  };
}

/**
 * Obtiene la ruta absoluta del worker de PDF.js basándose en el baseHref actual.
 */
function getWorkerSrc(): string {
  if (typeof window === 'undefined') {
    return '/pdf.worker.min.mjs';
  }
  
  let baseHref = '/';
  try {
    const baseEl = document.getElementsByTagName('base')[0];
    if (baseEl) {
      baseHref = baseEl.getAttribute('href') || '/';
    }
  } catch (e) {
    // Silencioso, usar el fallback
  }
  
  // Normalizar baseHref para que empiece y termine con /
  if (!baseHref.startsWith('/')) {
    baseHref = '/' + baseHref;
  }
  if (!baseHref.endsWith('/')) {
    baseHref = baseHref + '/';
  }
  
  return window.location.origin + baseHref + 'pdf.worker.min.mjs';
}

/**
 * Inicializa y configura el origen del worker de PDF.js.
 */
export function initPdfjsWorker(): void {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = getWorkerSrc();
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
}

/**
 * Carga un documento PDF a partir de un ArrayBuffer.
 * Si falla el Web Worker (por ejemplo, en dispositivos móviles o contextos HTTP inseguros),
 * carga dinámicamente el worker en el hilo principal como Fake Worker y reintenta.
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  // Asegurar que esté configurado al menos con el workerSrc inicial
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    initPdfjsWorker();
  }

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    return await loadingTask.promise;
  } catch (workerError) {
    console.warn('Fallo al inicializar el Web Worker de PDF.js local, intentando con Fake Worker en hilo principal...', workerError);
    const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
    
    try {
      // Importar dinámicamente el worker en el hilo principal como fallback de Fake Worker
      // @ts-expect-error - pdf.worker.mjs no tiene archivos de declaración de tipos en pdfjs-dist
      await import('pdfjs-dist/build/pdf.worker.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      return await loadingTask.promise;
    } catch (fallbackError) {
      console.error('Fallo definitivo al procesar el PDF con Fake Worker:', fallbackError);
      // Restablecer por si acaso y lanzar el error original
      pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
      throw fallbackError;
    }
  }
}

// Ejecutar inicialización al cargar el archivo
initPdfjsWorker();
