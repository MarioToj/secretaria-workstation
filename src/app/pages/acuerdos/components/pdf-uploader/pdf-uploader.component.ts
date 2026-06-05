import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';

@Component({
  selector: 'app-pdf-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './pdf-uploader.component.html'
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
