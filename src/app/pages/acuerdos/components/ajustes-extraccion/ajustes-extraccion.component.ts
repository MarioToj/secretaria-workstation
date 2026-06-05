import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalizadorFacturaService } from '../../services/analizador-factura.service';
import { PatronesExtraccion } from '../../interfaces/patrones-extraccion.interface';
import { PerfilesExtraccionComponent } from './perfiles-extraccion/perfiles-extraccion.component';
import { CamposExtraccionComponent } from './campos-extraccion/campos-extraccion.component';
import { VistaPreviaExtraccionComponent } from './vista-previa-extraccion/vista-previa-extraccion.component';

@Component({
  selector: 'app-ajustes-extraccion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PerfilesExtraccionComponent,
    CamposExtraccionComponent,
    VistaPreviaExtraccionComponent
  ],
  templateUrl: './ajustes-extraccion.component.html'
})
export class AjustesExtraccionComponent {
  protected readonly parserService = inject(AnalizadorFacturaService);

  // Inputs
  readonly rawText = input<string>('');
  readonly patterns = input<PatronesExtraccion>({
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  });

  // Outputs
  readonly patternsChange = output<PatronesExtraccion>();
  readonly close = output<void>();

  // Estado local para los inputs editables en formato Signal
  protected readonly editablePatterns = signal<PatronesExtraccion>({
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
