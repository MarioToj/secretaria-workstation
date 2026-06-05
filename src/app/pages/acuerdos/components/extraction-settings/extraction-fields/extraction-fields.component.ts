import { Component, ChangeDetectionStrategy, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExtractionPatterns } from '../../../interfaces/extraction-patterns.interface';
import { testPattern } from '../extraction-settings.helper';

@Component({
  selector: 'app-extraction-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    @for (field of fields; track field.key) {
      <div class="flex flex-col gap-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
        <label class="text-xs font-semibold text-slate-300 flex justify-between">
          <span>{{ field.label }}</span>
          <span class="text-[10px] text-slate-500 font-mono">key: {{ field.key }}</span>
        </label>
        <input 
          type="text" 
          [ngModel]="editablePatterns()[field.key]"
          (ngModelChange)="updatePattern(field.key, $event)"
          class="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 font-mono rounded-xl outline-none transition-all"
        />
        <!-- Vista previa rápida del match sobre el texto plano -->
        <span class="text-[11px] text-emerald-400/90 font-medium italic min-h-[16px] truncate">
          {{ getMatchPreview(field.key) }}
        </span>
      </div>
    }
  `
})
export class ExtractionFieldsComponent {
  readonly rawText = input.required<string>();
  readonly editablePatterns = model.required<ExtractionPatterns>();
  readonly patternsChange = output<ExtractionPatterns>();

  readonly fields: Array<{ key: keyof ExtractionPatterns; label: string }> = [
    { key: 'dte', label: 'Número de Autorización (DTE / UUID)' },
    { key: 'serie', label: 'Serie de la Factura' },
    { key: 'numero', label: 'Número de Factura' },
    { key: 'fecha', label: 'Fecha de Emisión' },
    { key: 'establecimiento', label: 'Nombre del Establecimiento / Emisor' },
    { key: 'direccion', label: 'Dirección del Establecimiento' },
    { key: 'dueno', label: 'Nombre del Dueño / Propietario' }
  ];

  updatePattern(key: keyof ExtractionPatterns, value: string): void {
    const current = { ...this.editablePatterns() };
    current[key] = value;
    this.editablePatterns.set(current);
    this.patternsChange.emit(current);
  }

  getMatchPreview(key: keyof ExtractionPatterns): string {
    return testPattern(this.rawText(), this.editablePatterns()[key]);
  }
}
