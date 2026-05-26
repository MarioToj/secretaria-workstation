import { Component, ChangeDetectionStrategy, input, signal, computed, effect, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura } from '../../services/pdf-parser.service';
import { downloadAsDocx, downloadAsDoc } from '../../utils/docx-generator.util';
import { numberToQuetzalesWords } from '../../utils/number-to-words.util';

@Component({
  selector: 'app-agreement-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule],
  templateUrl: './agreement-preview.component.html',
  styles: [`
    ol.roman-list li::marker {
      font-weight: bold;
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

  readonly fontFamily = input<string>('Arial');
  readonly fontSizeGeneral = input<number>(12);
  readonly fontSizeCert = input<number>(12);
  readonly fontSizeIncisos = input<number>(12);
  readonly fontSizeFirmas = input<number>(12);
  readonly cierreCertificacionText = input<string>('…No habiendo más… Damos fe: (fs.). —Ilegible. Mateo Velásquez Ralios. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. Karen Raquél Gómez López. Secretaria Municipal. – Se ven dos sellos.');
  readonly fontSizeCierreCert = input<number>(12);

  protected readonly fontStack = computed(() => {
    const font = this.fontFamily();
    return font === 'Arial Narrow' ? "'Arial Narrow', Arial, sans-serif" : font;
  });

  // Configuración de página mediante Signals
  protected readonly selectedPageSize = signal<'letter' | 'legal' | 'a4' | 'foolscap'>('letter');
  
  // Márgenes numéricos individuales en pulgadas
  protected readonly marginTop = signal<number>(1.0);
  protected readonly marginBottom = signal<number>(1.0);
  protected readonly marginLeft = signal<number>(1.0);
  protected readonly marginRight = signal<number>(1.0);

  // Estado local para alternar pestañas
  protected readonly activeTab = signal<'preview' | 'editor'>('preview');

  // Estado local para el editor manual de texto
  protected manualText = '';

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
      const marginPrint = `${t}in ${r}in ${b}in ${l}in`;

      // Aplicar al elemento raíz del documento
      document.documentElement.style.setProperty('--print-page-size', sizePrint);
      document.documentElement.style.setProperty('--print-page-margin', marginPrint);
    });
  }

  // Generar la versión en Markdown del texto para el editor y la descarga
  protected readonly compiledMarkdownText = computed(() => {
    const punto = this.puntoActa();
    const encab = this.encabezado();
    const cierr = this.cierre();
    const facts = this.facturas();
    const isCert = this.certificar();

    let text = `**<u>${punto}</u>**: ${encab}\n\n**ACUERDA**:\n\n`;

    facts.forEach((fact, idx) => {
      const roman = this.getRomanNumeral(idx + 1);
      
      const prodTexts = fact.productos.map(p => {
        const pPriceWords = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
        const pPriceNum = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 });
        const cleanDesc = p.descripcion.trim().replace(/\.+$/, '');
        const pGen = p.cantidad === 1 ? '' : (p.genero === 'femenino' ? ' cada una' : ' cada uno');
        return `**${p.cantidad}** ${cleanDesc}, con un valor de **${pPriceWords} (Q.${pPriceNum})**${pGen}`;
      }).join(', ');

      const totalWords = fact.totalEnLetras;
      const totalNum = fact.total.toLocaleString('en-US', { minimumFractionDigits: 2 });
      const duenoPart = (fact.dueno && fact.dueno !== 'PROPIETARIO NO ENCONTRADO') ? ` propiedad ${fact.tratamientoDueno} **${fact.dueno}**` : '';

      text += `**${roman}**. Aprobar el pago de la factura serie **${fact.serie}** Número de DTE **${fact.dte}**, de fecha **${fact.fecha}**, a **${fact.establecimiento}**, con dirección en **${fact.direccion}**${duenoPart}, por un valor de: **${totalWords}** (**Q.${totalNum}**), en concepto de pago de: ${prodTexts}${fact.solicitantes ? `, a solicitud de ${fact.solicitantes}` : ''}.\n\n`;
    });

    const cierreRoman = this.getRomanNumeral(facts.length + 1);
    text += `**${cierreRoman}**. ${cierr}`;

    if (!isCert) {
      return text;
    }

    const acta = this.numeroActa();
    const tipo = this.tipoSesion();
    const fSesion = this.fechaSesion();
    const fCert = this.fechaCertificacion();
    const secr = this.nombreSecretaria();
    const alc = this.nombreAlcalde();

    const certHeader = `**LA INFRASCRITA SECRETARIA MUNICIPAL DE LA VILLA DE JOYABAJ, DEL DEPARTAMENTO DE QUICHÉ, CERTIFICA:** Tener a la Vista el libro de Actas de la Corporación Municipal en uso debidamente autorizado por la Contraloría General de Cuentas de Quiché, en el cual se encuentra el Acta número **${acta}**, correspondiente a la Sesión Pública **${tipo}**, celebrada con fecha **${fSesion}**, en donde aparece el punto que copiado conducentemente establece:`;
    
    const certFooter = `${this.cierreCertificacionText()}\n\n**Y, PARA REMITIR A DONDE CORRESPONDA, COMPULSO LA PRESENTE CERTIFICACIÓN, DEBIDAMENTE CONFRONTADA CON SU ORIGINAL, LA QUE SELLO Y FIRMO, EN LA VILLA DE JOYABAJ, DEPARTAMENTO DE QUICHÉ, A ${fCert}.**`;
    
    const firmasTable = `<table border="0" style="width: 100%; table-layout: fixed; border: none; border-collapse: collapse; margin-top: 16pt;"><tr><td style="width: 2.9in; border: none; padding: 0; vertical-align: top;"><p style="text-align: center; margin: 0; font-family: ${this.fontStack()}; font-size: ${this.fontSizeFirmas()}pt; line-height: 115%;"><br/><br/><br/><br/><strong>${secr}</strong><br/>Secretaria Municipal</p></td><td style="width: 0.7in; border: none; padding: 0;">&nbsp;</td><td style="width: 2.9in; border: none; padding: 0; vertical-align: top;"><p style="text-align: center; margin: 0; font-family: ${this.fontStack()}; font-size: ${this.fontSizeFirmas()}pt; line-height: 115%;"><br/><br/><br/><br/>Vo. Bo. &nbsp; <strong>${alc}</strong><br/>Alcalde Municipal</p></td></tr></table>`;

    return `${certHeader}\n\n${text}\n\n${certFooter}\n\n${firmasTable}`;
  });

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

  getRomanNumeral(num: number): string {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return roman[num - 1] || num.toString();
  }

  resetManualText(): void {
    this.manualText = this.compiledMarkdownText();
  }

  // --- Dimensiones visuales dinámicas ---
  getPreviewPadding(): string {
    return `${this.marginTop()}in ${this.marginRight()}in ${this.marginBottom()}in ${this.marginLeft()}in`;
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

  private parseDateToNumeric(dateStr: string): string {
    if (!dateStr) return '';
    const months: { [key: string]: string } = {
      enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
      julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
    };
    const clean = dateStr.toLowerCase().trim();
    const match = clean.match(/^(\d{1,2})\s+de\s+([a-zñáéíóú]+)\s+de\s+(\d{4})/i);
    if (match) {
      const d = match[1].padStart(2, '0');
      const m = months[match[2]];
      const y = match[3];
      if (m) return `${d}-${m}-${y}`;
    }
    const matchNum = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})/);
    if (matchNum) {
      const d = matchNum[1].padStart(2, '0');
      const m = matchNum[2].padStart(2, '0');
      let y = matchNum[3];
      if (y.length === 2) y = '20' + y;
      return `${d}-${m}-${y}`;
    }
    return dateStr;
  }

  exportToWord(format: 'docx' | 'doc'): void {
    const textToExport = this.activeTab() === 'editor' ? this.manualText : this.compiledMarkdownText();
    
    const factList = this.facturas();
    // Obtener nombres de empresas únicos
    const companyNamesList = factList.map(f => f.establecimiento?.trim()).filter(Boolean);
    const uniqueCompanyNames = Array.from(new Set(companyNamesList)).join(' ');
    
    // Obtener fechas únicas convertidas a formato numérico
    const datesList = factList.map(f => this.parseDateToNumeric(f.fecha)).filter(Boolean);
    const uniqueDates = Array.from(new Set(datesList)).join(' ');
    
    const baseCompany = uniqueCompanyNames || 'ACUERDO';
    const baseDate = uniqueDates || 'SIN-FECHA';
    
    const suffix = this.certificar() ? ' CERTI' : '';
    const filename = `${baseCompany} ${baseDate}${suffix}`
      .toUpperCase()
      .replace(/[\/\\?%*:|"<>\.]/g, '') // Eliminar caracteres prohibidos
      .replace(/\s+/g, ' ') // Colapsar espacios múltiples
      .trim();

    if (format === 'docx') {
      downloadAsDocx(
        filename, 
        textToExport, 
        this.selectedPageSize(), 
        this.marginTop(), 
        this.marginRight(), 
        this.marginBottom(), 
        this.marginLeft(),
        this.fontFamily(),
        this.fontSizeGeneral(),
        this.fontSizeCert(),
        this.fontSizeIncisos(),
        this.fontSizeFirmas(),
        this.fontSizeCierreCert()
      );
    } else {
      downloadAsDoc(
        filename, 
        textToExport, 
        this.selectedPageSize(), 
        this.marginTop(), 
        this.marginRight(), 
        this.marginBottom(), 
        this.marginLeft(),
        this.fontFamily(),
        this.fontSizeGeneral(),
        this.fontSizeCert(),
        this.fontSizeIncisos(),
        this.fontSizeFirmas(),
        this.fontSizeCierreCert()
      );
    }
  }

  printPdf(): void {
    if (this.activeTab() === 'editor') {
      this.activeTab.set('preview');
    }

    const factList = this.facturas();
    // Obtener nombres de empresas únicos
    const companyNamesList = factList.map(f => f.establecimiento?.trim()).filter(Boolean);
    const uniqueCompanyNames = Array.from(new Set(companyNamesList)).join(' ');
    
    // Obtener fechas únicas convertidas a formato numérico
    const datesList = factList.map(f => this.parseDateToNumeric(f.fecha)).filter(Boolean);
    const uniqueDates = Array.from(new Set(datesList)).join(' ');
    
    const baseCompany = uniqueCompanyNames || 'ACUERDO';
    const baseDate = uniqueDates || 'SIN-FECHA';
    
    const suffix = this.certificar() ? ' CERTI' : '';
    const cleanFilename = `${baseCompany} ${baseDate}${suffix}`
      .toUpperCase()
      .replace(/[\/\\?%*:|"<>\.]/g, '') // Eliminar caracteres prohibidos
      .replace(/\s+/g, ' ') // Colapsar espacios múltiples
      .trim();

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
