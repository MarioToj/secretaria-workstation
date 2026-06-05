import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialogo-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm print:hidden" role="dialog" aria-modal="true">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            @if (tipo() === 'danger') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-5 h-5 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            } @else if (tipo() === 'warning') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-5 h-5 text-amber-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-5 h-5 text-indigo-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.05 1.05l-.04.04-.044-.02a.75.75 0 00-1.012-1.05zm-4.5 13.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0021.75 4.5h-15a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006.75 22.5z" />
              </svg>
            }
            {{ titulo() }}
          </h3>
          <p class="mt-3 text-sm text-slate-350 leading-relaxed font-sans">{{ mensaje() }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 mt-2">
          <button 
            type="button"
            (click)="cancelar.emit()"
            class="btn btn-sm btn-ghost rounded-xl cursor-pointer text-slate-400 hover:text-slate-200"
          >
            {{ textoCancelar() }}
          </button>
          <button 
            type="button"
            (click)="confirmar.emit()"
            [class]="confirmButtonClass()"
            class="btn btn-sm rounded-xl cursor-pointer"
          >
            {{ textoConfirmar() }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DialogoConfirmacionComponent {
  readonly titulo = input<string>('¿Estás seguro?');
  readonly mensaje = input<string>('Esta acción no se puede deshacer.');
  readonly textoConfirmar = input<string>('Confirmar');
  readonly textoCancelar = input<string>('Cancelar');
  readonly tipo = input<'info' | 'warning' | 'danger'>('warning');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  readonly confirmButtonClass = computed(() => {
    switch (this.tipo()) {
      case 'danger':
        return 'btn-error text-white border-none';
      case 'warning':
        return 'btn-warning text-slate-900 border-none';
      default:
        return 'btn-primary text-white border-none';
    }
  });
}
