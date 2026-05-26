import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../services/pdf-parser.service';
import { InvoiceFormComponent } from './invoice-form.component';

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InvoiceFormComponent],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 shrink-0">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-indigo-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 class="text-sm font-bold text-slate-100 tracking-tight">Editor de Facturas</h3>
        </div>
        <span class="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold rounded-lg">
          {{ facturas().length }} Cargada(s)
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <!-- Lista de Facturas en Acordeón -->
        @for (fact of facturas(); track fact.id; let idx = $index) {
          <div 
            [class]="'border rounded-2xl overflow-hidden transition-all duration-300 ' + 
                     (fact.id === selectedId() 
                       ? 'bg-slate-950/60 border-indigo-500/80 shadow-[0_8px_30px_rgba(99,102,241,0.1)] mt-2 mb-3' 
                       : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-950/60')"
          >
            <!-- Cabecera de la Factura (Siempre visible) -->
            <div 
              class="flex items-center justify-between p-3.5 cursor-pointer select-none"
              (click)="selectInvoice(fact.id)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Índice Romano coloreado por índice -->
                <span [class]="'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold font-mono transition-all duration-300 ' + 
                              getRomanBadgeClass(idx, fact.id === selectedId())"
                >
                  {{ getRomanNumeral(idx + 1) }}
                </span>
                <div class="min-w-0 leading-tight">
                  <p class="text-xs font-bold text-slate-200 truncate">{{ fact.establecimiento || 'Factura sin nombre' }}</p>
                  <p class="text-[10px] text-slate-500 font-mono mt-1 truncate">
                    Serie {{ fact.serie || '-' }} · No. {{ fact.numero || '-' }} · 
                    <span class="text-indigo-400 font-bold">Q.{{ fact.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                  </p>
                </div>
              </div>

              <!-- Controles del Item -->
              <div class="flex items-center gap-1 shrink-0">
                <!-- Botón Lápiz para alternar edición (con stopPropagation para evitar doble disparo) -->
                <button 
                  type="button" 
                  [class]="'p-1.5 rounded-lg transition-all ' + 
                           (fact.id === selectedId() 
                             ? 'text-indigo-400 bg-indigo-500/10' 
                             : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800')"
                  (click)="selectInvoice(fact.id); $event.stopPropagation()"
                  title="Editar esta factura"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>

                <!-- Botón de eliminación -->
                @if (facturas().length > 1) {
                  <button 
                    type="button" 
                    (click)="deleteInvoice($event, fact.id)"
                    class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                    title="Eliminar factura"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <!-- Formulario de Edición Inline (Solo visible si está seleccionada) -->
            @if (fact.id === selectedId()) {
              <div class="border-t border-slate-800/80 p-4 bg-slate-900/40 rounded-b-2xl relative select-text animate-[fadeIn_0.2s_ease-out]">
                <!-- Botón rápido para adjuntar PDF a la factura activa -->
                <div class="absolute top-3 right-3 z-10">
                  <input 
                    #attachPdfInput
                    type="file" 
                    accept="application/pdf" 
                    (change)="attachPdfToActive($event, attachPdfInput)" 
                    class="hidden" 
                  />
                  <button 
                    type="button"
                    (click)="attachPdfInput.click()"
                    class="flex items-center gap-1 py-1.5 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-950/40"
                    title="Cargar factura PDF para poblar los campos de esta tarjeta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                    Cargar PDF
                  </button>
                </div>

                <app-invoice-form 
                  [factura]="fact"
                  (invoiceUpdated)="invoiceUpdated.emit($event)"
                ></app-invoice-form>
              </div>
            }
          </div>
        }

        <!-- Botones para Añadir Factura (Manual o PDF) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full">
          <button 
            type="button" 
            (click)="addInvoice()"
            class="flex items-center justify-center gap-1.5 p-3 bg-slate-950/60 hover:bg-slate-800 text-indigo-400 border border-dashed border-indigo-600/30 hover:border-indigo-600 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Factura Manual
          </button>

          <button 
            type="button" 
            (click)="pdfFileInput.click()"
            class="flex items-center justify-center gap-1.5 p-3 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-dashed border-indigo-500/30 hover:border-indigo-600 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            + Cargar PDFs
          </button>
          
          <input 
            #pdfFileInput
            type="file" 
            accept="application/pdf" 
            multiple
            (change)="onPdfsUploaded(pdfFileInput.files); pdfFileInput.value = ''" 
            class="hidden" 
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class InvoiceListComponent {
  // Inputs/Outputs
  readonly facturas = input<Factura[]>([]);
  readonly selectedId = input<string>('');

  readonly invoiceSelected = output<string>();
  readonly invoiceAdded = output<void>();
  readonly invoiceDeleted = output<string>();
  readonly invoiceUpdated = output<Factura>();
  readonly uploadPdfs = output<File[]>();
  readonly attachPdf = output<File>();

  onPdfsUploaded(files: FileList | null): void {
    if (files && files.length > 0) {
      const pdfs: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
          pdfs.push(file);
        }
      }
      if (pdfs.length > 0) {
        this.uploadPdfs.emit(pdfs);
      }
    }
  }

  attachPdfToActive(event: Event, inputEl: HTMLInputElement): void {
    const files = inputEl.files;
    if (files && files.length > 0) {
      this.attachPdf.emit(files[0]);
    }
    inputEl.value = ''; // Reset file input
  }

  selectInvoice(id: string): void {
    this.invoiceSelected.emit(id);
  }

  addInvoice(): void {
    this.invoiceAdded.emit();
  }

  deleteInvoice(event: Event, id: string): void {
    event.stopPropagation(); // Evitar que se seleccione la factura al hacer clic en eliminar
    this.invoiceDeleted.emit(id);
  }

  /**
   * Convierte un número arábigo a romano (soporte simple hasta el 10)
   */
  getRomanNumeral(num: number): string {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return roman[num - 1] || num.toString();
  }

  /**
   * Obtiene la clase de color para el badge del número romano, según el índice.
   */
  getRomanBadgeClass(index: number, isSelected: boolean): string {
    if (isSelected) {
      return 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20';
    }

    // Variar colores para que los incisos se distingan bien
    const colors = [
      'bg-amber-500/10 border border-amber-500/30 text-amber-400',
      'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400',
      'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
      'bg-purple-500/10 border border-purple-500/30 text-purple-400',
      'bg-rose-500/10 border border-rose-500/30 text-rose-400',
      'bg-blue-500/10 border border-blue-500/30 text-blue-400',
    ];
    return colors[index % colors.length];
  }
}
