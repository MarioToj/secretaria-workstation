import { Component, ChangeDetectionStrategy, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatronesExtraccion } from '../../../interfaces/patrones-extraccion.interface';
import { testPattern } from '../ajustes-extraccion.helper';

@Component({
  selector: 'app-campos-extraccion',
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
          class="input input-bordered w-full bg-slate-950 text-slate-200 font-mono rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 outline-none transition-all"
        />
        <!-- Vista previa rápida del match sobre el texto plano -->
        <span class="text-[11px] text-emerald-400/90 font-medium italic min-h-[16px] truncate">
          {{ getMatchPreview(field.key) }}
        </span>
      </div>
    }
  `
})
export class CamposExtraccionComponent {
  readonly rawText = input.required<string>();
  readonly editablePatterns = model.required<PatronesExtraccion>();
  readonly patternsChange = output<PatronesExtraccion>();

  readonly fields: Array<{ key: keyof PatronesExtraccion; label: string }> = [
    { key: 'dte', label: 'Número de Autorización (DTE / UUID)' },
    { key: 'serie', label: 'Serie de la Factura' },
    { key: 'numero', label: 'Número de Factura' },
    { key: 'fecha', label: 'Fecha de Emisión' },
    { key: 'establecimiento', label: 'Nombre del Establecimiento / Emisor' },
    { key: 'direccion', label: 'Dirección del Establecimiento' },
    { key: 'dueno', label: 'Nombre del Dueño / Propietario' }
  ];

  updatePattern(key: keyof PatronesExtraccion, value: string): void {
    const current = { ...this.editablePatterns() };
    current[key] = value;
    this.editablePatterns.set(current);
    this.patternsChange.emit(current);
  }

  getMatchPreview(key: keyof PatronesExtraccion): string {
    return testPattern(this.rawText(), this.editablePatterns()[key]);
  }
}
