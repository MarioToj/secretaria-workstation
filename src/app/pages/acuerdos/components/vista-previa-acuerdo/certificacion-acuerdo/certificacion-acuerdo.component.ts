import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificacion-acuerdo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './certificacion-acuerdo.component.html'
})
export class CertificacionAcuerdoComponent {
  readonly certificar = input<boolean>(false);
  readonly numeroActa = input<string>('');
  readonly tipoSesion = input<string>('Ordinaria');
  readonly fechaSesion = input<string>('');
  readonly fechaCertificacion = input<string>('');
  readonly cierreCertificacionText = input<string>('');
  readonly fontSizeCert = input<number>(11);
  readonly fontSizeCierreCert = input<number>(11);
}
