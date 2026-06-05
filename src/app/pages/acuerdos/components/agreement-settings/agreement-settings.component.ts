import { Component, ChangeDetectionStrategy, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SesionType } from '../../types/sesion-type.type';

@Component({
  selector: 'app-agreement-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './agreement-settings.component.html',
  host: {
    'class': 'bg-slate-900/60 backdrop-blur-md border border-slate-800/85 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 shrink-0 transition-all duration-300 hover:border-slate-800'
  }
})
export class AgreementSettingsComponent {
  readonly certificar = model<boolean>(false);
  readonly puntoActa = model<string>('');
  readonly encabezado = model<string>('');
  readonly cierre = model<string>('');
  
  readonly fontFamily = model<string>('');
  readonly fontSizeGeneral = model<number>(11);
  readonly fontSizeIncisos = model<number>(11);
  readonly lineSpacing = model<number>(1.0);
  
  readonly fontSizeCert = model<number>(11);
  readonly fontSizeCierreCert = model<number>(11);
  readonly fontSizeFirmas = model<number>(11);
  readonly espacioFirmas = model<number>(4);
  
  readonly tipoSesion = model<SesionType>('Ordinaria');
  readonly numeroActa = model<string>('');
  readonly fechaSesion = model<string>('');
  readonly fechaCertificacion = model<string>('');
  readonly nombreSecretaria = model<string>('');
  readonly nombreAlcalde = model<string>('');
  readonly cierreCertificacionText = model<string>('');
  
  readonly configureRegex = output<void>();
}
