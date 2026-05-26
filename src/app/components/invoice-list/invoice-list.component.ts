import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../services/pdf-parser.service';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InvoiceFormComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
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
