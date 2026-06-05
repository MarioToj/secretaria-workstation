import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-extraction-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
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
  `
})
export class ExtractionPreviewComponent {
  readonly rawText = input.required<string>();
}
