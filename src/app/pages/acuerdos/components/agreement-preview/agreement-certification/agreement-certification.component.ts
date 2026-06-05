import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agreement-certification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './agreement-certification.component.html'
})
export class AgreementCertificationComponent {
  readonly certificar = input<boolean>(false);
  readonly numeroActa = input<string>('');
  readonly tipoSesion = input<string>('Ordinaria');
  readonly fechaSesion = input<string>('');
  readonly fechaCertificacion = input<string>('');
  readonly cierreCertificacionText = input<string>('');
  readonly fontSizeCert = input<number>(11);
  readonly fontSizeCierreCert = input<number>(11);
}
