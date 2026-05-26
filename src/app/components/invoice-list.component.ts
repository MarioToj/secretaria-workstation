import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../services/pdf-parser.service';

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 shrink-0">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Facturas en este Acuerdo</h3>
        <span class="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-full">
          Total: {{ facturas().length }}
        </span>
      </div>

      <div class="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none pr-1">
        <!-- Lista de Facturas -->
        @for (fact of facturas(); track fact.id; let idx = $index) {
          <div 
            [class]="'flex items-center justify-between min-w-[200px] md:min-w-0 p-3 rounded-2xl border transition-all duration-200 cursor-pointer group ' +
                     (fact.id === selectedId() 
                       ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)]' 
                       : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-950/70')"
            (click)="selectInvoice(fact.id)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Índice Romano -->
              <span [class]="'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono ' + 
                            (fact.id === selectedId() ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300')">
                {{ getRomanNumeral(idx + 1) }}
              </span>
              <!-- Detalles -->
              <div class="min-w-0 leading-tight">
                <p class="text-xs font-semibold text-slate-200 truncate">{{ fact.establecimiento || 'Sin nombre' }}</p>
                <p class="text-[10px] text-slate-500 font-mono mt-0.5 truncate">Serie {{ fact.serie || '-' }} · No. {{ fact.numero || '-' }}</p>
              </div>
            </div>

            <!-- Botón de eliminación -->
            @if (facturas().length > 1) {
              <button 
                type="button" 
                (click)="deleteInvoice($event, fact.id)"
                class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900/60 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Eliminar factura"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            }
          </div>
        }

        <!-- Botones para Añadir Factura (Manual o PDF) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 md:mt-2 w-full">
          <button 
            type="button" 
            (click)="addInvoice()"
            class="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950/60 hover:bg-slate-800 text-indigo-400 border border-dashed border-indigo-600/30 hover:border-indigo-600 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Factura Manual
          </button>

          <button 
            type="button" 
            (click)="pdfFileInput.click()"
            class="flex items-center justify-center gap-1.5 p-2.5 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-dashed border-indigo-500/30 hover:border-indigo-600 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            + Facturas desde PDF
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
  `
})
export class InvoiceListComponent {
  // Inputs/Outputs
  readonly facturas = input<Factura[]>([]);
  readonly selectedId = input<string>('');
 
  readonly invoiceSelected = output<string>();
  readonly invoiceAdded = output<void>();
  readonly invoiceDeleted = output<string>();
  readonly uploadPdfs = output<File[]>();

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
}
