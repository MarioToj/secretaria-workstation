import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageSize } from '../../../../../shared/types/page-size.type';

@Component({
  selector: 'app-controles-acuerdo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './controles-acuerdo.component.html'
})
export class ControlesAcuerdoComponent {
  // Inputs
  readonly activeTab = input.required<'preview' | 'editor'>();
  readonly selectedPageSize = input.required<PageSize>();
  readonly showMargins = input.required<boolean>();
  readonly marginTop = input.required<number>();
  readonly marginBottom = input.required<number>();
  readonly marginLeft = input.required<number>();
  readonly marginRight = input.required<number>();

  // Outputs
  readonly activeTabChange = output<'preview' | 'editor'>();
  readonly selectedPageSizeChange = output<PageSize>();
  readonly showMarginsChange = output<boolean>();
  readonly marginTopChange = output<number>();
  readonly marginBottomChange = output<number>();
  readonly marginLeftChange = output<number>();
  readonly marginRightChange = output<number>();
  readonly exportWord = output<'docx' | 'doc'>();
  readonly printPdf = output<void>();
}
