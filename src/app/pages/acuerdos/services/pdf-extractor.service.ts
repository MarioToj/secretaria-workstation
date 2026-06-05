import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js usando el archivo copiado en el directorio público con fallback dinámico
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs';
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

@Injectable({
  providedIn: 'root'
})
export class PdfExtractorService {

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
        console.warn('Fallo al inicializar el Web Worker de PDF.js local, intentando con CDN de unpkg...', workerError);
        const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
        
        try {
          // Intentar cargar desde unpkg CDN para la misma versión
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          pdf = await loadingTask.promise;
        } catch (cdnError) {
          console.warn('Fallo al inicializar el Web Worker de PDF.js desde CDN, intentando con Fake Worker...', cdnError);
          // Intentar con el fake worker (sin workerSrc) para entornos móviles/HTTP locales restrictivos
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
}
