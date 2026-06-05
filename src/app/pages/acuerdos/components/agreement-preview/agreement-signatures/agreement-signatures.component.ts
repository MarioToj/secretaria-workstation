import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agreement-signatures',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './agreement-signatures.component.html'
})
export class AgreementSignaturesComponent {
  readonly nombreSecretaria = input.required<string>();
  readonly nombreAlcalde = input.required<string>();
  readonly espacioFirmas = input<number>(4);
  readonly fontSizeFirmas = input<number>(11);
  readonly lineSpacing = input<number>(1.0);

  protected readonly espacioFirmasBr = computed(() => '<br/>'.repeat(this.espacioFirmas()));
}
