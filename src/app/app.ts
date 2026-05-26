import { Component, ChangeDetectionStrategy, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfParserService, Factura, ExtractionPatterns } from './services/pdf-parser.service';
import { PdfUploaderComponent } from './components/pdf-uploader/pdf-uploader.component';
import { ExtractionSettingsComponent } from './components/extraction-settings/extraction-settings.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { AgreementPreviewComponent } from './components/agreement-preview/agreement-preview.component';
import { getClosestPastWednesday, dateToSpanishWords, dateToSpanishCertDate } from './utils/number-to-words.util';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PdfUploaderComponent,
    ExtractionSettingsComponent,
    InvoiceListComponent,
    AgreementPreviewComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly parserService = inject(PdfParserService);

  // --- Estado de la Aplicación mediante Signals ---
  
  // Lista de facturas consolidadas en el acuerdo
  readonly facturas = signal<Factura[]>([]);
  
  // ID de la factura seleccionada actualmente para edición
  readonly selectedInvoiceId = signal<string>('');

  // Configuración de patrones Regex para parsear facturas (con persistencia en localStorage)
  readonly patterns = signal<ExtractionPatterns>(this.loadPatternsFromStorage());

  // Visibilidad del panel de configuración Regex
  readonly showSettings = signal<boolean>(false);

  // Texto plano extraído del último PDF (para depuración en ajustes)
  readonly rawText = signal<string>('');

  // Estado de carga y errores
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  // Variables globales del acuerdo municipal
  readonly puntoActa = signal<string>('DÉCIMO NOVENO');
  readonly encabezado = signal<string>('Los Integrantes del Honorable Concejo Municipal Sesionante por medio del levantamiento de su mano derecha en señal de aprobación, de conformidad con las facultades que les otorga el Código Municipal y sus reformas, L.C.E. Decreto 57 – 92, 9 – 2015, 46-2016, Acuerdo (S) Gubernativo (S) 122-2016, 172-2017, por disposición mayoritaria:');
  readonly cierre = signal<string>('Se ordena a la Dirección de la Administración Financiera Integrada Municipal, realizar el pago contra documentos de descargo. Transcríbase.');

  // Variables de Certificación
  readonly certificar = signal<boolean>(false);
  readonly nombreSecretaria = signal<string>('Karen Raquél Gómez López');
  readonly nombreAlcalde = signal<string>('Mateo Velásquez Ralios');
  readonly tipoSesion = signal<'Ordinaria' | 'Extraordinaria'>('Ordinaria');
  readonly numeroActa = signal<string>('016-2,025');
  readonly fechaSesion = signal<string>(dateToSpanishWords(getClosestPastWednesday()));
  readonly fechaCertificacion = signal<string>(dateToSpanishCertDate(new Date()));

  // Tipografías y tamaños personalizados
  readonly fontFamily = signal<string>(this.loadStringFromStorage('fontFamily', 'Arial'));
  readonly fontSizeGeneral = signal<number>(this.loadNumFromStorage('fontSizeGeneral', 11));
  readonly fontSizeCert = signal<number>(this.loadNumFromStorage('fontSizeCert', 11));
  readonly fontSizeIncisos = signal<number>(this.loadNumFromStorage('fontSizeIncisos', 11));
  readonly fontSizeFirmas = signal<number>(this.loadNumFromStorage('fontSizeFirmas', 11));
  readonly cierreCertificacionText = signal<string>('…No habiendo más… Damos fe: (fs.). —Ilegible. Mateo Velásquez Ralios. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. Karen Raquél Gómez López. Secretaria Municipal. – Se ven dos sellos.');
  readonly fontSizeCierreCert = signal<number>(this.loadNumFromStorage('fontSizeCierreCert', 11));
  readonly espacioFirmas = signal<number>(this.loadNumFromStorage('espacioFirmas', 4));
  readonly lineSpacing = signal<number>(this.loadNumFromStorage('lineSpacing', 1.0));
  private isCierreCustomized = false;

  // Factura seleccionada activa
  readonly activeInvoice = computed(() => {
    const list = this.facturas();
    const id = this.selectedInvoiceId();
    return list.find(f => f.id === id) || null;
  });

  // --- Manejo de Eventos y Lógica ---

  private loadPatternsFromStorage(): ExtractionPatterns {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('invoice_extraction_patterns_v8');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error al parsear patrones de localStorage', e);
        }
      }
    }
    return { ...this.parserService.defaultPatterns };
  }

  onPatternsChanged(newPatterns: ExtractionPatterns): void {
    this.patterns.set(newPatterns);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('invoice_extraction_patterns_v8', JSON.stringify(newPatterns));
    }
  }




  async onFilesSelected(files: File[]): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    
    try {
      const parsedInvoices: Factura[] = [];
      let lastExtractedText = '';
      
      for (const file of files) {
        const extractedText = await this.parserService.extractText(file);
        lastExtractedText = extractedText;

        const parsedInvoice = this.parserService.parseInvoice(extractedText, this.patterns());
        parsedInvoices.push(parsedInvoice);
      }
      
      if (lastExtractedText) {
        this.rawText.set(lastExtractedText);
      }

      this.facturas.update(list => [...list, ...parsedInvoices]);
      // Por defecto, mantener colapsadas las facturas cargadas
      this.selectedInvoiceId.set('');
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al procesar los archivos PDF.');
    } finally {
      this.loading.set(false);
    }
  }

  onInvoiceUpdated(updatedInvoice: Factura): void {
    this.facturas.update(list => 
      list.map(f => f.id === updatedInvoice.id ? updatedInvoice : f)
    );
  }

  onInvoiceSelected(id: string): void {
    if (this.selectedInvoiceId() === id) {
      this.selectedInvoiceId.set('');
    } else {
      this.selectedInvoiceId.set(id);
    }
  }

  onInvoiceAdded(): void {
    // Agregar una factura vacía para llenado manual por defecto
    const newInvoice: Factura = {
      id: Math.random().toString(36).substring(2, 9),
      dte: '',
      serie: '',
      numero: '',
      fecha: new Date().toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }),
      establecimiento: '',
      direccion: '',
      dueno: '',
      tratamientoDueno: 'del señor',
      solicitantes: '',
      prefijoSolicitantes: 'de',
      productos: [{ cantidad: 1, descripcion: 'Nuevo Producto', precioUnitario: 0, genero: 'masculino' }],
      total: 0,
      totalEnLetras: 'CERO QUETZALES EXACTOS',
      conceptoDetallado: ''
    };

    this.facturas.update(list => [...list, newInvoice]);
    this.selectedInvoiceId.set(newInvoice.id);
  }

  onInvoiceDeleted(id: string): void {
    this.facturas.update(list => {
      const filtered = list.filter(f => f.id !== id);
      // Si borramos la factura actualmente activa, seleccionamos otra de la lista
      if (id === this.selectedInvoiceId() && filtered.length > 0) {
        this.selectedInvoiceId.set(filtered[0].id);
      }
      return filtered;
    });
  }

  // Permite asociar un PDF directamente a la factura activa actual (para re-parsear)
  async onAttachPdfToActive(file: File): Promise<void> {
    const active = this.activeInvoice();
    if (!active) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const extractedText = await this.parserService.extractText(file);
      this.rawText.set(extractedText);

      const parsed = this.parserService.parseInvoice(extractedText, this.patterns());
      
      // Conservar el ID original de la factura y los solicitantes previos
      parsed.id = active.id;
      parsed.solicitantes = active.solicitantes;

      this.onInvoiceUpdated(parsed);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al procesar el archivo.');
    } finally {
      this.loading.set(false);
    }
  }

  resetAll(): void {
    this.facturas.set([]);
    this.selectedInvoiceId.set('');
    this.rawText.set('');
    this.errorMessage.set('');
    this.isCierreCustomized = false;
  }

  onCierreCertTextChange(val: string): void {
    this.isCierreCustomized = true;
    this.cierreCertificacionText.set(val);
  }

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('invoice_app_fontFamily', this.fontFamily());
        localStorage.setItem('invoice_app_fontSizeGeneral', this.fontSizeGeneral().toString());
        localStorage.setItem('invoice_app_fontSizeCert', this.fontSizeCert().toString());
        localStorage.setItem('invoice_app_fontSizeIncisos', this.fontSizeIncisos().toString());
        localStorage.setItem('invoice_app_fontSizeFirmas', this.fontSizeFirmas().toString());
        localStorage.setItem('invoice_app_fontSizeCierreCert', this.fontSizeCierreCert().toString());
        localStorage.setItem('invoice_app_espacioFirmas', this.espacioFirmas().toString());
        localStorage.setItem('invoice_app_lineSpacing', this.lineSpacing().toString());
      }
    });

    effect(() => {
      const alc = this.nombreAlcalde();
      const secr = this.nombreSecretaria();
      if (!this.isCierreCustomized) {
        this.cierreCertificacionText.set(`…No habiendo más… Damos fe: (fs.). —Ilegible. ${alc}. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. ${secr}. Secretaria Municipal. – Se ven dos sellos.`);
      }
    });
  }

  private loadStringFromStorage(key: string, defaultValue: string): string {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(`invoice_app_${key}`);
      if (val) return val;
    }
    return defaultValue;
  }

  private loadNumFromStorage(key: string, defaultValue: number): number {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(`invoice_app_${key}`);
      if (val) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return defaultValue;
  }
}
