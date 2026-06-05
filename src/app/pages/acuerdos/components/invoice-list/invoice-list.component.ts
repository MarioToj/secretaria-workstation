import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../interfaces/factura.interface';
import { InvoiceCardComponent } from './invoice-card/invoice-card.component';

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InvoiceCardComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent {
  // Estado reactivo para dragover
  protected readonly isDragOver = signal(false);

  // Inputs/Outputs
  readonly facturas = input<Factura[]>([]);
  readonly selectedId = input<string>('');

  readonly invoiceSelected = output<string>();
  readonly invoiceAdded = output<void>();
  readonly invoiceDeleted = output<string>();
  readonly invoiceUpdated = output<Factura>();
  readonly uploadPdfs = output<File[]>();
  readonly attachPdf = output<File>();

  // Suma total calculada de todas las facturas
  readonly totalSum = computed(() => {
    return this.facturas().reduce((sum, f) => sum + (f.total || 0), 0);
  });

  formatNumber(val: number): string {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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
        this.uploadPdfs.emit(pdfs);
      }
    }
  }

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

  deleteInvoice(id: string): void {
    this.invoiceDeleted.emit(id);
  }
}
