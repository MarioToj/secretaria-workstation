import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Factura } from '../interfaces/factura.interface';
import { PatronesExtraccion } from '../interfaces/patrones-extraccion.interface';
import { TipoSesion } from '../types/tipo-sesion.type';
import { ExtractorPdfService } from './extractor-pdf.service';
import { AnalizadorFacturaService } from './analizador-factura.service';
import { AcuerdosStorageService } from './acuerdos-storage.service';
import { getClosestPastWednesday, dateToSpanishWords, dateToSpanishCertDate } from '../../../shared/utils/date.util';

@Injectable({
  providedIn: 'root'
})
export class AcuerdosStore {
  private readonly extractorPdfService = inject(ExtractorPdfService);
  private readonly analizadorFacturaService = inject(AnalizadorFacturaService);
  private readonly storageService = inject(AcuerdosStorageService);

  // --- Estado de la Aplicación mediante Signals ---
  readonly facturas = signal<Factura[]>([]);
  readonly selectedInvoiceId = signal<string>('');
  readonly patterns = signal<PatronesExtraccion>(
    this.storageService.loadPatterns(this.analizadorFacturaService.defaultPatterns)
  );
  readonly showSettings = signal<boolean>(false);
  readonly rawText = signal<string>('');
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
  readonly tipoSesion = signal<TipoSesion>('Ordinaria');
  readonly numeroActa = signal<string>('016-2,025');
  readonly fechaSesion = signal<string>(dateToSpanishWords(getClosestPastWednesday()));
  readonly fechaCertificacion = signal<string>(dateToSpanishCertDate(new Date()));

  // Tipografías y tamaños personalizados
  readonly fontFamily = signal<string>(this.storageService.loadString('fontFamily', 'Arial Narrow'));
  readonly fontSizeGeneral = signal<number>(this.storageService.loadNum('fontSizeGeneral', 11));
  readonly fontSizeCert = signal<number>(this.storageService.loadNum('fontSizeCert', 11));
  readonly fontSizeIncisos = signal<number>(this.storageService.loadNum('fontSizeIncisos', 11));
  readonly fontSizeFirmas = signal<number>(this.storageService.loadNum('fontSizeFirmas', 11));
  readonly cierreCertificacionText = signal<string>('…No habiendo más… Damos fe: (fs.). —Ilegible. Mateo Velásquez Ralios. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. Karen Raquél Gómez López. Secretaria Municipal. – Se ven dos sellos.');
  readonly fontSizeCierreCert = signal<number>(this.storageService.loadNum('fontSizeCierreCert', 11));
  readonly espacioFirmas = signal<number>(this.storageService.loadNum('espacioFirmas', 4));
  readonly lineSpacing = signal<number>(this.storageService.loadNum('lineSpacing', 1.0));
  private isCierreCustomized = false;

  // Factura seleccionada activa
  readonly activeInvoice = computed(() => {
    const list = this.facturas();
    const id = this.selectedInvoiceId();
    return list.find(f => f.id === id) || null;
  });

  constructor() {
    // Persistencia automática de configuraciones
    effect(() => {
      this.storageService.saveString('fontFamily', this.fontFamily());
      this.storageService.saveNum('fontSizeGeneral', this.fontSizeGeneral());
      this.storageService.saveNum('fontSizeCert', this.fontSizeCert());
      this.storageService.saveNum('fontSizeIncisos', this.fontSizeIncisos());
      this.storageService.saveNum('fontSizeFirmas', this.fontSizeFirmas());
      this.storageService.saveNum('fontSizeCierreCert', this.fontSizeCierreCert());
      this.storageService.saveNum('espacioFirmas', this.espacioFirmas());
      this.storageService.saveNum('lineSpacing', this.lineSpacing());
    });

    // Párrafo de cierre por defecto reactivo
    effect(() => {
      const alc = this.nombreAlcalde();
      const secr = this.nombreSecretaria();
      if (!this.isCierreCustomized) {
        this.cierreCertificacionText.set(`…No habiendo más… Damos fe: (fs.). —Ilegible. ${alc}. Alcalde Municipal. — (fs) Ilegibles Concejo Municipal. CERTIFICO: (f) Ilegible. ${secr}. Secretaria Municipal. – Se ven dos sellos.`);
      }
    });
  }

  onPatternsChanged(newPatterns: PatronesExtraccion): void {
    this.patterns.set(newPatterns);
    this.storageService.savePatterns(newPatterns);
  }

  async onFilesSelected(files: File[]): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    
    try {
      const parsedInvoices: Factura[] = [];
      let lastExtractedText = '';
      
      for (const file of files) {
        const extractedText = await this.extractorPdfService.extractText(file);
        lastExtractedText = extractedText;

        const parsedInvoice = this.analizadorFacturaService.parseInvoice(extractedText, this.patterns());
        parsedInvoices.push(parsedInvoice);
      }
      
      if (lastExtractedText) {
        this.rawText.set(lastExtractedText);
      }

      this.facturas.update(list => [...list, ...parsedInvoices]);
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
      if (id === this.selectedInvoiceId() && filtered.length > 0) {
        this.selectedInvoiceId.set(filtered[0].id);
      }
      return filtered;
    });
  }

  async onAttachPdfToActive(file: File): Promise<void> {
    const active = this.activeInvoice();
    if (!active) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const extractedText = await this.extractorPdfService.extractText(file);
      this.rawText.set(extractedText);

      const parsed = this.analizadorFacturaService.parseInvoice(extractedText, this.patterns());
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
}
