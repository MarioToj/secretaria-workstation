import { Injectable } from '@angular/core';
import { loadPdfDocument } from '../utils/pdf.util';

@Injectable({
  providedIn: 'root'
})
export class ExtractorPdfService {

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

      // Cargar el documento PDF usando el utilitario que maneja el worker y el fallback a Fake Worker
      const pdf = await loadPdfDocument(arrayBuffer);
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
