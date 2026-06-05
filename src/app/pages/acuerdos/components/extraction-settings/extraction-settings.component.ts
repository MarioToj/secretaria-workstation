import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceParserService } from '../../services/invoice-parser.service';
import { ExtractionPatterns } from '../../interfaces/extraction-patterns.interface';
import { ExtractionProfilesComponent } from './extraction-profiles/extraction-profiles.component';
import { ExtractionFieldsComponent } from './extraction-fields/extraction-fields.component';
import { ExtractionPreviewComponent } from './extraction-preview/extraction-preview.component';

@Component({
  selector: 'app-extraction-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ExtractionProfilesComponent,
    ExtractionFieldsComponent,
    ExtractionPreviewComponent
  ],
  templateUrl: './extraction-settings.component.html'
})
export class ExtractionSettingsComponent {
  protected readonly parserService = inject(InvoiceParserService);

  // Inputs
  readonly rawText = input<string>('');
  readonly patterns = input<ExtractionPatterns>({
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  });

  // Outputs
  readonly patternsChange = output<ExtractionPatterns>();
  readonly close = output<void>();

  // Estado local para los inputs editables en formato Signal
  protected readonly editablePatterns = signal<ExtractionPatterns>({
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  });

  constructor() {
    // Sincronizar el valor inicial del input con nuestro estado editable usando un effect
    effect(() => {
      const patternsVal = this.patterns();
      if (patternsVal) {
        this.editablePatterns.set({ ...patternsVal });
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  restoreDefaults(): void {
    const defaults = { ...this.parserService.defaultPatterns };
    this.editablePatterns.set(defaults);
    this.patternsChange.emit(defaults);
  }
}
