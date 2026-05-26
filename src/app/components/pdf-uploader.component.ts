import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';

@Component({
  selector: 'app-pdf-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div 
      (dragover)="onDragOver($event)" 
      (dragleave)="onDragLeave()" 
      (drop)="onDrop($event)"
      [class]="'relative w-full max-w-2xl p-10 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group ' +
               (isDragOver() 
                 ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-[1.01]' 
                 : 'border-slate-700 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]')"
      (click)="fileInput.click()"
    >
      <!-- Input oculto -->
      <input 
        #fileInput 
        type="file" 
        accept="application/pdf" 
        multiple
        (change)="onFileSelected($event)" 
        class="hidden" 
      />

      <!-- Efecto de gradiente brillante de fondo -->
      <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

      <!-- Icono Animado -->
      <div [class]="'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ' + 
                   (isDragOver() ? 'bg-indigo-600 text-white rotate-6 scale-110' : 'bg-slate-800/80 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:scale-105')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>

      <!-- Textos principales -->
      <h3 class="text-xl font-semibold text-slate-100 mb-2 text-center group-hover:text-white transition-colors duration-200">
        Arrastra tus facturas en PDF aquí
      </h3>
      <p class="text-slate-400 text-sm text-center mb-6 max-w-md group-hover:text-slate-300 transition-colors duration-200">
        Carga una o varias facturas digitales de Guatecompras (SAT) para extraer automáticamente DTE, productos, precios, nombres y generar el acuerdo de forma instantánea.
      </p>

      <!-- Botón secundario -->
      <button 
        type="button"
        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        Seleccionar Archivos
      </button>

      <span class="text-xs text-slate-500 mt-4 block">Soporta formatos PDF de facturas electrónicas de Guatemala (puedes elegir varios)</span>
    </div>
  `
})
export class PdfUploaderComponent {
  // Estado reactivo para dragover
  readonly isDragOver = signal(false);

  // Evento de salida para múltiples archivos
  readonly filesSelected = output<File[]>();

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files) {
      const pdfs: File[] = [];
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          pdfs.push(file);
        }
      }
      if (pdfs.length > 0) {
        this.filesSelected.emit(pdfs);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const pdfs: File[] = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          pdfs.push(file);
        }
      }
      if (pdfs.length > 0) {
        this.filesSelected.emit(pdfs);
      }
    }
  }
}
