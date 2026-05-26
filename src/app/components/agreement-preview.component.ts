import { Component, ChangeDetectionStrategy, input, signal, computed, effect, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura } from '../services/pdf-parser.service';
import { downloadAsDocx, downloadAsDoc } from '../utils/docx-generator.util';
import { numberToQuetzalesWords } from '../utils/number-to-words.util';

@Component({
  selector: 'app-agreement-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl h-full flex flex-col min-h-0 print:border-none print:bg-white print:p-0 print:shadow-none">
      
      <!-- Controles Superiores (Ocultar al imprimir) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4 shrink-0 print:hidden">
        <div>
          <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-indigo-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Acuerdo Municipal Generado
          </h2>
          <p class="text-xs text-slate-400 mt-1">Vista previa del acta formal con negritas y opciones de exportación.</p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex gap-2">
          <button 
            type="button" 
            (click)="exportToWord('docx')"
            class="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3m3-3v3m-10.125-3h14.25" />
            </svg>
            Word (DOCX)
          </button>
          
          <button 
            type="button" 
            (click)="exportToWord('doc')"
            class="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium rounded-xl text-xs transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3m3-3v3m-10.125-3h14.25" />
            </svg>
            Word (DOC)
          </button>
          
          <button 
            type="button" 
            (click)="printPdf()"
            class="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium rounded-xl text-xs transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821V7.5a.75.75 0 0 1 .22-.53l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 .22.53v6.321m-10.5 0a3.75 3.75 0 1 1 7.5 0m-7.5 0h7.5m-7.5 0v3.75m7.5-3.75v3.75m-.75 0h-6M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            PDF (Imprimir)
          </button>
        </div>
      </div>

      <!-- Configuración de Diseño de Hoja y Márgenes Precisos (Ocultar al imprimir) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl print:hidden text-xs shrink-0">
        <!-- Tamaño de Hoja -->
        <div class="flex items-center gap-2">
          <span class="font-semibold text-slate-400">Tamaño Hoja:</span>
          <select 
            [ngModel]="selectedPageSize()"
            (ngModelChange)="selectedPageSize.set($event)"
            class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg cursor-pointer outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="letter">Carta (Letter)</option>
            <option value="legal">Oficio (Legal 14")</option>
            <option value="foolscap">Oficio / Folio (8.5" x 13")</option>
            <option value="a4">A4</option>
          </select>
        </div>

        <!-- Ajuste Preciso de Márgenes en Pulgadas -->
        <div class="flex flex-col gap-1.5">
          <span class="font-semibold text-slate-400">Márgenes (Pulgadas - in):</span>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <span class="text-slate-500 text-[10px]">Sup:</span>
              <input 
                type="number" 
                [ngModel]="marginTop()" 
                (ngModelChange)="marginTop.set($event)"
                step="0.1" 
                min="0" 
                class="w-14 px-1.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-center rounded focus:border-indigo-500 outline-none font-mono"
              />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-slate-500 text-[10px]">Inf:</span>
              <input 
                type="number" 
                [ngModel]="marginBottom()" 
                (ngModelChange)="marginBottom.set($event)"
                step="0.1" 
                min="0" 
                class="w-14 px-1.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-center rounded focus:border-indigo-500 outline-none font-mono"
              />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-slate-500 text-[10px]">Izq:</span>
              <input 
                type="number" 
                [ngModel]="marginLeft()" 
                (ngModelChange)="marginLeft.set($event)"
                step="0.1" 
                min="0" 
                class="w-14 px-1.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-center rounded focus:border-indigo-500 outline-none font-mono"
              />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-slate-500 text-[10px]">Der:</span>
              <input 
                type="number" 
                [ngModel]="marginRight()" 
                (ngModelChange)="marginRight.set($event)"
                step="0.1" 
                min="0" 
                class="w-14 px-1.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-center rounded focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Toggles de Modo (Vista Previa vs Edición Manual) -->
      <div class="flex gap-2 mb-4 p-1 bg-slate-950/60 rounded-xl w-fit border border-slate-800/80 print:hidden shrink-0">
        <button 
          (click)="activeTab.set('preview')"
          [class]="'px-4 py-2 rounded-lg text-xs font-semibold transition-all ' + 
                   (activeTab() === 'preview' ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-400 hover:text-slate-200')"
        >
          Vista Previa Compilada
        </button>
        <button 
          (click)="activeTab.set('editor')"
          [class]="'px-4 py-2 rounded-lg text-xs font-semibold transition-all ' + 
                   (activeTab() === 'editor' ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-400 hover:text-slate-200')"
        >
          Editor Libre
        </button>
      </div>

      <!-- Contenedor del Documento -->
      <div class="flex-1 min-h-0 overflow-y-auto pr-1 select-text print:overflow-visible">        <!-- Vista Previa Compilada (Con formato HTML y hojas de estilo que emulan papel) -->
        @if (activeTab() === 'preview') {
          <div 
            [style.padding]="getPreviewPadding()"
            [style.font-family]="fontStack()"
            [style.font-size.pt]="fontSizeGeneral()"
            class="bg-white text-slate-900 border border-slate-200 rounded-2xl min-h-[500px] h-auto shadow-lg text-justify print:border-none print:p-0 print:shadow-none print:text-black mx-auto w-full transition-all duration-300"
            style="line-height: 1.15;"
          >
            @if (certificar()) {
              <p [style.font-size.pt]="fontSizeCert()" style="margin: 0; text-align: justify;">
                <strong>LA INFRASCRITA SECRETARIA MUNICIPAL DE LA VILLA DE JOYABAJ, DEL DEPARTAMENTO DE QUICHÉ, CERTIFICA:</strong> Tener a la Vista el libro de Actas de la Corporación Municipal en uso debidamente autorizado por la Contraloría General de Cuentas de Quiché, en el cual se encuentra el Acta número <strong>{{ numeroActa() }} </strong>, correspondiente a la Sesión Pública <strong>{{ tipoSesion() }}</strong>, celebrada con fecha <strong>{{ fechaSesion() }}</strong>, en donde aparece el punto que copiado conducentemente establece:
              </p>
            }

            <p style="margin: 0; text-align: justify;">
              <strong>{{ puntoActa() }}</strong>: {{ encabezado() }}
            </p>
            
            <p style="margin: 0; font-weight: bold; text-align: center;">ACUERDA:</p>

            <div class="space-y-0">
              @for (fact of facturas(); track fact.id; let idx = $index) {
                <p [style.font-size.pt]="fontSizeIncisos()" style="margin: 0 0 0 0.5in; text-indent: -0.25in; text-align: justify;">
                  <strong>{{ getRomanNumeral(idx + 1) }}</strong>. Aprobar el pago de la factura serie <strong>{{ fact.serie }}</strong> Número de DTE <strong>{{ fact.dte }}</strong>, de fecha <strong>{{ fact.fecha }}</strong>, a <strong>{{ fact.establecimiento }}</strong>, con dirección en <strong>{{ fact.direccion }}</strong>@if (fact.dueno && fact.dueno !== 'PROPIETARIO NO ENCONTRADO') { propiedad {{ fact.tratamientoDueno }} <strong>{{ fact.dueno }}</strong>}, por un valor de: <strong>{{ fact.totalEnLetras }}</strong> (<strong>Q.{{ formatNumber(fact.total) }}</strong>), en concepto de pago de: <span [innerHTML]="getFormattedConcept(fact)"></span>@if (fact.solicitantes) {, a solicitud de {{ fact.solicitantes }}}.
                </p>
              }
              
              <!-- Cierre del Acuerdo -->
              <p [style.font-size.pt]="fontSizeIncisos()" style="margin: 0 0 0 0.5in; text-indent: -0.25in; text-align: justify;">
                <strong>{{ getRomanNumeral(facturas().length + 1) }}</strong>. {{ cierre() }}
              </p>
            </div>

            @if (certificar()) {
              <p [style.font-size.pt]="fontSizeCierreCert()" style="margin: 0; text-align: justify;">
                {{ cierreCertificacionText() }}
              </p>
              <p [style.font-size.pt]="fontSizeCert()" style="margin: 0; text-align: justify;">
                <strong>Y, PARA REMITIR A DONDE CORRESPONDA, COMPULSO LA PRESENTE CERTIFICACIÓN, DEBIDAMENTE CONFRONTADA CON SU ORIGINAL, LA QUE SELLO Y FIRMO, EN LA VILLA DE JOYABAJ, DEPARTAMENTO DE QUICHÉ, A {{ fechaCertificacion() }}.</strong>
              </p>
              
              <table border="0" style="width: 100%; table-layout: fixed; border: none; border-collapse: collapse;" class="mt-4">
                <tr [style.font-size.pt]="fontSizeFirmas()">
                  <td style="width: 2.9in; border: none; padding: 0; color: #000; line-height: 1.15; vertical-align: top;">
                    <p style="text-align: center; margin: 0;">
                      <br/><br/><br/><br/>
                      <strong>{{ nombreSecretaria() }}</strong><br/>
                      <span style="font-size: 0.85em; opacity: 0.8;">Secretaria Municipal</span>
                    </p>
                  </td>
                  <td style="width: 0.7in; border: none; padding: 0;">&nbsp;</td>
                  <td style="width: 2.9in; border: none; padding: 0; color: #000; line-height: 1.15; vertical-align: top;">
                    <p style="text-align: center; margin: 0;">
                      <br/><br/><br/><br/>
                      Vo. Bo. &nbsp; <strong>{{ nombreAlcalde() }}</strong><br/>
                      <span style="font-size: 0.85em; opacity: 0.8;">Alcalde Municipal</span>
                    </p>
                  </td>
                </tr>
              </table>
            }
          </div>
        }

        <!-- Editor Libre (Para cambios finos directos en el texto final) -->
        @if (activeTab() === 'editor') {
          <div class="h-full flex flex-col gap-2 min-h-[400px] print:hidden">
            <div class="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Puedes usar marcas **texto** para negrita en este editor.</span>
              <button 
                (click)="resetManualText()"
                class="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Regenerar desde Formulario
              </button>
            </div>
            <textarea 
              [(ngModel)]="manualText"
              class="flex-1 w-full p-6 bg-slate-950 border border-slate-800 text-slate-300 font-mono text-sm leading-relaxed rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none select-text"
              placeholder="Escribe o edita el acuerdo libremente aquí..."
            ></textarea>
          </div>
        }
      </div>

    </div>
  `
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

    let text = `**${punto}**: ${encab}\n\n**ACUERDA**:\n\n`;

    facts.forEach((fact, idx) => {
      const roman = this.getRomanNumeral(idx + 1);
      
      const prodTexts = fact.productos.map(p => {
        const pPriceWords = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
        const pPriceNum = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 });
        const pGen = p.genero === 'femenino' ? 'cada una' : 'cada uno';
        return `**${p.cantidad}** ${p.descripcion.toLowerCase()}, con un valor de **${pPriceWords} (Q.${pPriceNum})** ${pGen}`;
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
      const pGen = p.genero === 'femenino' ? 'cada una' : 'cada uno';
      return `<strong>${p.cantidad}</strong> ${p.descripcion.toLowerCase()}, con un valor de <strong>${pPriceWords} (Q.${pPriceNum})</strong> ${pGen}`;
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

  exportToWord(format: 'docx' | 'doc'): void {
    const textToExport = this.activeTab() === 'editor' ? this.manualText : this.compiledMarkdownText();
    
    const parseDateToNumeric = (dateStr: string): string => {
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
    };

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

    const parseDateToNumeric = (dateStr: string): string => {
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
    };

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
