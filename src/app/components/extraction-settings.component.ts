import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExtractionPatterns, PdfParserService } from '../services/pdf-parser.service';

@Component({
  selector: 'app-extraction-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-indigo-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
            </svg>
            Patrones de Extracción (Regex)
          </h2>
          <p class="text-xs text-slate-400 mt-1">Si cambia el formato de la factura, edita las expresiones regulares aquí.</p>
        </div>
        <button 
          (click)="onClose()" 
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido en 2 Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-y-auto pr-1">
        
        <!-- Columna Izquierda: Ajustes Regex -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Configurar Expresiones Regulares</h3>
          
          @for (field of fields; track field.key) {
            <div class="flex flex-col gap-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <label class="text-xs font-semibold text-slate-300 flex justify-between">
                <span>{{ field.label }}</span>
                <span class="text-[10px] text-slate-500 font-mono">key: {{ field.key }}</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="editablePatterns[field.key]"
                (ngModelChange)="onPatternChange()"
                class="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 font-mono rounded-xl outline-none transition-all"
              />
              <!-- Vista previa rápida del match sobre el texto plano -->
              <span class="text-[11px] text-emerald-400/90 font-medium italic min-h-[16px] truncate">
                {{ getMatchPreview(field.key) }}
              </span>
            </div>
          }

          <div class="pt-4 flex gap-3">
            <button 
              (click)="restoreDefaults()"
              class="flex-1 py-2.5 px-4 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-medium rounded-xl text-sm transition-all"
            >
              Restaurar Valores por Defecto
            </button>
          </div>
        </div>

        <!-- Columna Derecha: Texto Plano Extraído del PDF -->
        <div class="flex flex-col h-full min-h-[300px] lg:min-h-0">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Texto Plano Extraído del PDF</h3>
            <span class="text-[11px] text-slate-500 font-mono">{{ rawText().length }} caracteres</span>
          </div>
          
          <div class="flex-1 min-h-0 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 font-mono text-xs text-slate-400 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
            @if (rawText()) {
              {{ rawText() }}
            } @else {
              <div class="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span>No se ha cargado ningún PDF aún. Sube una factura para ver el texto extraído aquí.</span>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class ExtractionSettingsComponent {
  private readonly parserService = inject(PdfParserService);

  // Inputs usando signal inputs (input())
  readonly rawText = input<string>('');
  readonly patterns = input<ExtractionPatterns>({
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  });

  // Outputs usando output()
  readonly patternsChange = output<ExtractionPatterns>();
  readonly close = output<void>();

  // Estado local para los inputs editables
  protected editablePatterns: { [key: string]: string } = {};

  readonly fields = [
    { key: 'dte', label: 'Número de Autorización (DTE / UUID)' },
    { key: 'serie', label: 'Serie de la Factura' },
    { key: 'numero', label: 'Número de Factura' },
    { key: 'fecha', label: 'Fecha de Emisión' },
    { key: 'establecimiento', label: 'Nombre del Establecimiento / Emisor' },
    { key: 'direccion', label: 'Dirección del Establecimiento' },
    { key: 'dueno', label: 'Nombre del Dueño / Propietario' }
  ];

  constructor() {
    // Sincronizar el valor inicial del input con nuestro estado editable usando un effect
    effect(() => {
      const patternsVal = this.patterns();
      if (patternsVal) {
        this.editablePatterns = { ...patternsVal };
      }
    });
  }

  onPatternChange(): void {
    this.patternsChange.emit(this.editablePatterns as unknown as ExtractionPatterns);
  }

  onClose(): void {
    this.close.emit();
  }

  restoreDefaults(): void {
    const defaults = { ...this.parserService.defaultPatterns };
    this.editablePatterns = { ...defaults };
    this.patternsChange.emit(defaults);
  }

  /**
   * Ejecuta en vivo el Regex sobre el texto plano para mostrar qué coincidencia encuentra.
   */
  getMatchPreview(key: string): string {
    const textVal = this.rawText();
    const pattern = this.editablePatterns[key];
    if (!textVal || !pattern) return 'Sin datos';

    try {
      const regex = new RegExp(pattern, 'i');
      const match = textVal.match(regex);
      if (match) {
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            return `Coincidencia: "${match[i].trim()}"`;
          }
        }
      }
      return 'Sin coincidencias con el patrón actual';
    } catch (e) {
      return 'Sintaxis Regex Inválida';
    }
  }
}
