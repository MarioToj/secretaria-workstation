import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CargadorPdfComponent } from '../cargador-pdf/cargador-pdf.component';

@Component({
  selector: 'app-acuerdos-bienvenida',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CargadorPdfComponent],
  template: `
    <div class="w-full max-w-4xl flex flex-col items-center gap-8 print:hidden py-12 px-4 animate-[fadeIn_0.4s_ease-out]">
      <!-- Header de Bienvenida -->
      <div class="text-center max-w-xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5 tracking-wide uppercase font-mono">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Secretaría Municipal Workstation
        </div>
        <h1 class="text-4xl font-display font-black tracking-tight text-white sm:text-5xl leading-none">
          Generador de <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-extrabold">Acuerdos de Pago</span>
        </h1>
        <p class="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
          Carga las facturas electrónicas de la SAT en formato PDF para redactar y certificar los acuerdos municipales correspondientes de forma automática y precisa.
        </p>
      </div>

      <!-- Uploader -->
      <app-cargador-pdf (filesSelected)="filesSelected.emit($event)"></app-cargador-pdf>

      <!-- Separador u Opción Manual -->
      <div class="flex items-center gap-4 w-full max-w-md my-2">
        <hr class="flex-1 border-slate-800/80" />
        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">o también</span>
        <hr class="flex-1 border-slate-800/80" />
      </div>

      <button 
        type="button"
        (click)="invoiceAdded.emit()"
        class="btn btn-outline btn-primary rounded-2xl shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:outline-none"
      >
        Crear Factura Manualmente
      </button>
    </div>
  `
})
export class AcuerdosBienvenidaComponent {
  readonly filesSelected = output<File[]>();
  readonly invoiceAdded = output<void>();
}
