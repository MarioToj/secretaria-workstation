import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../../interfaces/factura.interface';
import { numberToQuetzalesWords } from '../../../../../shared/utils/words.util';

@Component({
  selector: 'app-agreement-invoices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './agreement-invoices.component.html'
})
export class AgreementInvoicesComponent {
  readonly facturas = input.required<Factura[]>();
  readonly puntoActa = input<string>('DÉCIMO NOVENO');
  readonly encabezado = input<string>('');
  readonly cierre = input<string>('');
  readonly fontSizeIncisos = input<number>(11);

  getFormattedConcept(fact: Factura): string {
    if (!fact.productos) return '';
    return fact.productos.map(p => {
      const pPriceWords = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
      const pPriceNum = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 });
      const cleanDesc = p.descripcion.trim().replace(/\.+$/, '');
      const pGen = p.cantidad === 1 ? '' : (p.genero === 'femenino' ? ' cada una' : ' cada uno');
      return `<strong>${p.cantidad}</strong> ${cleanDesc}, con un valor de <strong>${pPriceWords} (Q.${pPriceNum})</strong>${pGen}`;
    }).join(', ');
  }

  formatNumber(val: number): string {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
