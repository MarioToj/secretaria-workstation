import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../../interfaces/factura.interface';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { getRomanNumeral } from '../../../../../shared/utils/words.util';

@Component({
  selector: 'app-invoice-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InvoiceFormComponent],
  templateUrl: './invoice-card.component.html'
})
export class InvoiceCardComponent {
  // Inputs usando signal inputs (input())
  readonly factura = input.required<Factura>();
  readonly selectedId = input<string>('');
  readonly index = input.required<number>();
  readonly totalInvoices = input.required<number>();

  // Outputs usando signal outputs (output())
  readonly invoiceSelected = output<string>();
  readonly invoiceDeleted = output<string>();
  readonly invoiceUpdated = output<Factura>();
  readonly attachPdf = output<File>();

  selectInvoice(): void {
    this.invoiceSelected.emit(this.factura().id);
  }

  deleteInvoice(event: Event): void {
    event.stopPropagation(); // Evitar que se seleccione la factura al hacer clic en eliminar
    this.invoiceDeleted.emit(this.factura().id);
  }

  attachPdfToActive(event: Event, inputEl: HTMLInputElement): void {
    const files = inputEl.files;
    if (files && files.length > 0) {
      this.attachPdf.emit(files[0]);
    }
    inputEl.value = ''; // Limpiar el input de archivo
  }

  /**
   * Convierte un número arábigo a romano (soporte simple hasta el 10)
   */
  getRomanNumeral(): string {
    return getRomanNumeral(this.index() + 1);
  }

  /**
   * Obtiene la clase de color para el badge del número romano, según el índice.
   */
  getRomanBadgeClass(): string {
    const isSelected = this.factura().id === this.selectedId();
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
    return colors[this.index() % colors.length];
  }
}
