import { Component, ChangeDetectionStrategy, input, signal, computed, effect, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura } from '../../interfaces/factura.interface';
import { PageSize } from '../../../../shared/types/page-size.type';
import { downloadAsDocx, downloadAsDoc } from '../../utils/docx-generator.util';
import { getRomanNumeral } from '../../../../shared/utils/words.util';
import { parseDateToNumeric } from '../../../../shared/utils/date.util';
import { generateAgreementMarkdown } from '../../utils/agreement-formatter.util';
import { AgreementControlsComponent } from './agreement-controls/agreement-controls.component';
import { AgreementCertificationComponent } from './agreement-certification/agreement-certification.component';
import { AgreementInvoicesComponent } from './agreement-invoices/agreement-invoices.component';
import { AgreementSignaturesComponent } from './agreement-signatures/agreement-signatures.component';

@Component({
  selector: 'app-agreement-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, 
    FormsModule, 
    AgreementControlsComponent, 
    AgreementCertificationComponent, 
    AgreementInvoicesComponent, 
    AgreementSignaturesComponent
  ],
  templateUrl: './agreement-preview.component.html',
  styles: [`
    ol.roman-list li::marker {
      font-weight: bold;
    }
    .preview-container {
      padding: var(--preview-padding);
    }
    @media print {
      .preview-container {
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  `]
})
export class AgreementPreviewComponent {
  // Inputs usando signal inputs
  readonly facturas = input<Factura[]>([]);
  readonly puntoActa = input<string>('DÉCIMO NOVENO');
  readonly encabezado = input<string>('Los Integrantes del Honorable Concejo Municipal Sesionante por medio del levantamiento de su mano derecha en señal de aprobación, de conformidad con las facultades que les otorga el Código Municipal y sus reformas, L.C.E. Decreto 57 – 92, 9 – 2015, 46-2016, Acuerdo (S) Gubernativo (S) 122-2016, 172-2017, por disposición mayoritaria:');
  readonly cierre = input<string>('Se ordena a la Dirección de la Administración Financiera Integrada Municipal, realizar el pago contra documentos de descargo. Transcríbase.');
  
  readonly certificar = input<boolean>(false);
  readonly nombreSecretaria = input<string>('Karen Raquél Gómez López');
  readonly nombreAlcalde = input<string>('Mateo Velásquez Ralios');
  readonly tipoSesion = input<string>('Ordinaria');
  readonly numeroActa = input<string>('016-2,025');
  readonly fechaSesion = input<string>('');
  readonly fechaCertificacion = input<string>('');

  readonly fontFamily = input<string>('Arial Narrow');
  readonly fontSizeGeneral = input<number>(11);
  readonly fontSizeCert = input<number>(11);
  readonly fontSizeIncisos = input<number>(11);
  readonly fontSizeFirmas = input<number>(11);
  readonly cierreCertificacionText = input<string>('…No habiendo más… Damos fe: (fs.). —Ilegible. Mateo Velásquez Ralios. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. Karen Raquél Gómez López. Secretaria Municipal. – Se ven dos sellos.');
  readonly fontSizeCierreCert = input<number>(11);
  readonly espacioFirmas = input<number>(4);
  readonly lineSpacing = input<number>(1.0);

  protected readonly fontStack = computed(() => {
    const font = this.fontFamily();
    return font === 'Arial Narrow' ? "'Arial Narrow', Arial, sans-serif" : font;
  });

  // Configuración de página mediante Signals
  protected readonly selectedPageSize = signal<PageSize>('foolscap');
  
  // Márgenes numéricos individuales en centímetros (cm)
  protected readonly marginTop = signal<number>(5.5); // Margen superior por defecto de 5.5 cm
  protected readonly marginBottom = signal<number>(2.0);  // 2 cm
  protected readonly marginLeft = signal<number>(2.0);    // 2 cm
  protected readonly marginRight = signal<number>(2.0);   // 2 cm

  // Estado local para alternar pestañas
  protected readonly activeTab = signal<'preview' | 'editor'>('preview');

  // Estado local para mostrar u ocultar la configuración de márgenes
  protected readonly showMargins = signal<boolean>(false);

  // Generar nombre de archivo único para exportar y compartir
  protected readonly currentFilename = computed(() => {
    const factList = this.facturas();
    // Obtener nombres de empresas únicos
    const companyNamesList = factList.map(f => f.establecimiento?.trim()).filter(Boolean);
    const uniqueCompanyNames = Array.from(new Set(companyNamesList)).join(' ');
    
    // Obtener fechas únicas convertidas a formato numérico
    const datesList = factList.map(f => parseDateToNumeric(f.fecha)).filter(Boolean);
    const uniqueDates = Array.from(new Set(datesList)).join(' ');
    
    const baseCompany = uniqueCompanyNames || 'ACUERDO';
    const baseDate = uniqueDates || 'SIN-FECHA';
    
    const suffix = this.certificar() ? ' CERTI' : '';
    return `${baseCompany} ${baseDate}${suffix}`
      .toUpperCase()
      .replace(/[\/\\?%*:|"<>\.]/g, '') // Eliminar caracteres prohibidos
      .replace(/\s+/g, ' ') // Colapsar espacios múltiples
      .trim();
  });

  // Estado local para el editor manual de texto
  protected manualText = '';

  // Validación de solicitantes antes de descarga/impresión
  protected readonly showValidationError = signal<boolean>(false);
  protected readonly validationErrorMsg = signal<string>('');

  constructor() {
    effect(() => {
      this.manualText = this.compiledMarkdownText();
    });

    // Efecto para actualizar las variables CSS de impresión globales cuando cambien los signals
    effect(() => {
      const size = this.selectedPageSize();
      const t = this.marginTop();
      const b = this.marginBottom();
      const l = this.marginLeft();
      const r = this.marginRight();

      // Mapear tamaño
      const sizePrint = size === 'letter' ? 'letter' : size === 'legal' ? '8.5in 14.0in' : size === 'foolscap' ? '8.5in 13.0in' : 'A4';
      const marginPrint = `${t}cm ${r}cm ${b}cm ${l}cm`;

      // Aplicar al elemento raíz del documento
      document.documentElement.style.setProperty('--print-page-size', sizePrint);
      document.documentElement.style.setProperty('--print-page-margin', marginPrint);
    });

    // Efecto para ocultar el mensaje de error si el usuario solventa los solicitantes faltantes
    effect(() => {
      if (this.showValidationError() && !this.hasMissingApplicants()) {
        this.showValidationError.set(false);
      }
    });
  }

  protected onPageSizeChange(size: 'letter' | 'legal' | 'a4' | 'foolscap'): void {
    this.selectedPageSize.set(size);
    if (size === 'foolscap' || size === 'letter') {
      this.marginTop.set(5.5);
      this.marginBottom.set(2.0);
      this.marginLeft.set(2.0);
      this.marginRight.set(2.0);
    } else {
      this.marginTop.set(2.54);
      this.marginBottom.set(2.54);
      this.marginLeft.set(2.54);
      this.marginRight.set(2.54);
    }
  }

  // Generar la versión en Markdown del texto para el editor y la descarga
  protected readonly compiledMarkdownText = computed(() => {
    return generateAgreementMarkdown({
      puntoActa: this.puntoActa(),
      encabezado: this.encabezado(),
      cierre: this.cierre(),
      facturas: this.facturas(),
      certificar: this.certificar(),
      numeroActa: this.numeroActa(),
      tipoSesion: this.tipoSesion(),
      fechaSesion: this.fechaSesion(),
      fechaCertificacion: this.fechaCertificacion(),
      nombreSecretaria: this.nombreSecretaria(),
      nombreAlcalde: this.nombreAlcalde(),
      fontStack: this.fontStack(),
      fontSizeFirmas: this.fontSizeFirmas(),
      lineSpacing: this.lineSpacing(),
      espacioFirmas: this.espacioFirmas(),
      cierreCertificacionText: this.cierreCertificacionText()
    });
  });

  resetManualText(): void {
    this.manualText = this.compiledMarkdownText();
  }

  // --- Dimensiones visuales dinámicas ---
  getPreviewPadding(): string {
    const factor = 0.45; // Factor de escala para que la vista previa en pantalla no tenga márgenes excesivos
    const t = (this.marginTop() * factor).toFixed(2);
    const r = (this.marginRight() * factor).toFixed(2);
    const b = (this.marginBottom() * factor).toFixed(2);
    const l = (this.marginLeft() * factor).toFixed(2);
    return `${t}cm ${r}cm ${b}cm ${l}cm`;
  }

  getPreviewAspectRatio(): string {
    const ratios = {
      letter: '8.5 / 11',
      legal: '8.5 / 14',
      a4: '8.27 / 11.69',
      foolscap: '8.5 / 13'
    };
    return ratios[this.selectedPageSize()];
  }

  protected hasMissingApplicants(): boolean {
    return this.facturas().some(f => !f.solicitantes || f.solicitantes.trim() === '');
  }

  private handleMissingApplicantsError(actionType: 'descargar' | 'imprimir'): void {
    const pendingNames = this.facturas()
      .map((f, idx) => ({ f, roman: getRomanNumeral(idx + 1) }))
      .filter(item => !item.f.solicitantes || item.f.solicitantes.trim() === '')
      .map(item => `Factura ${item.roman}`)
      .join(', ');
    
    this.validationErrorMsg.set(
      `Para ${actionType} el archivo, debe agregar al solicitante en las siguientes facturas: ${pendingNames}`
    );
    this.showValidationError.set(true);
  }

  exportToWord(format: 'docx' | 'doc'): void {
    if (this.hasMissingApplicants()) {
      this.handleMissingApplicantsError('descargar');
      return;
    }

    const textToExport = this.activeTab() === 'editor' ? this.manualText : this.compiledMarkdownText();
    const filename = this.currentFilename();
    const tIn = this.marginTop() / 2.54;
    const rIn = this.marginRight() / 2.54;
    const bIn = this.marginBottom() / 2.54;
    const lIn = this.marginLeft() / 2.54;

    if (format === 'docx') {
      downloadAsDocx(
        filename, 
        textToExport, 
        this.selectedPageSize(), 
        tIn, 
        rIn, 
        bIn, 
        lIn,
        this.fontFamily(),
        this.fontSizeGeneral(),
        this.fontSizeCert(),
        this.fontSizeIncisos(),
        this.fontSizeFirmas(),
        this.fontSizeCierreCert(),
        this.lineSpacing()
      );
    } else {
      downloadAsDoc(
        filename, 
        textToExport, 
        this.selectedPageSize(), 
        tIn, 
        rIn, 
        bIn, 
        lIn,
        this.fontFamily(),
        this.fontSizeGeneral(),
        this.fontSizeCert(),
        this.fontSizeIncisos(),
        this.fontSizeFirmas(),
        this.fontSizeCierreCert(),
        this.lineSpacing()
      );
    }
  }

  printPdf(): void {
    if (this.hasMissingApplicants()) {
      this.handleMissingApplicantsError('imprimir');
      return;
    }

    if (this.activeTab() === 'editor') {
      this.activeTab.set('preview');
    }

    const cleanFilename = this.currentFilename();

    // Guardar el título original de la página y asignar el nombre del archivo temporalmente para la impresión
    const originalTitle = document.title;
    document.title = cleanFilename;

    setTimeout(() => {
      window.print();
      // Restaurar el título original después de que abra el diálogo
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 100);
  }
}
