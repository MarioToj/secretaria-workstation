import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatronesExtraccion } from './interfaces/patrones-extraccion.interface';
import { Factura } from './interfaces/factura.interface';
import { AjustesExtraccionComponent } from './components/ajustes-extraccion/ajustes-extraccion.component';
import { ListaFacturasComponent } from './components/lista-facturas/lista-facturas.component';
import { VistaPreviaAcuerdoComponent } from './components/vista-previa-acuerdo/vista-previa-acuerdo.component';
import { AcuerdosBienvenidaComponent } from './components/acuerdos-bienvenida/acuerdos-bienvenida.component';
import { AjustesAcuerdoComponent } from './components/ajustes-acuerdo/ajustes-acuerdo.component';
import { AcuerdosStore } from './services/acuerdos.store';

@Component({
  selector: 'app-acuerdos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    AjustesExtraccionComponent,
    ListaFacturasComponent,
    VistaPreviaAcuerdoComponent,
    AcuerdosBienvenidaComponent,
    AjustesAcuerdoComponent
  ],
  templateUrl: './acuerdos.component.html',
  styleUrl: './acuerdos.component.css'
})
export class AcuerdosComponent {
  private readonly store = inject(AcuerdosStore);

  // --- Estado de la Aplicación mediante Signals (Delegado al Store) ---
  readonly facturas = this.store.facturas;
  readonly selectedInvoiceId = this.store.selectedInvoiceId;
  readonly patterns = this.store.patterns;
  readonly showSettings = this.store.showSettings;
  readonly rawText = this.store.rawText;
  readonly loading = this.store.loading;
  readonly errorMessage = this.store.errorMessage;

  // Variables globales del acuerdo municipal (Delegado al Store)
  readonly puntoActa = this.store.puntoActa;
  readonly encabezado = this.store.encabezado;
  readonly cierre = this.store.cierre;

  // Variables de Certificación (Delegado al Store)
  readonly certificar = this.store.certificar;
  readonly nombreSecretaria = this.store.nombreSecretaria;
  readonly nombreAlcalde = this.store.nombreAlcalde;
  readonly tipoSesion = this.store.tipoSesion;
  readonly numeroActa = this.store.numeroActa;
  readonly fechaSesion = this.store.fechaSesion;
  readonly fechaCertificacion = this.store.fechaCertificacion;

  // Tipografías y tamaños personalizados (Delegado al Store)
  readonly fontFamily = this.store.fontFamily;
  readonly fontSizeGeneral = this.store.fontSizeGeneral;
  readonly fontSizeCert = this.store.fontSizeCert;
  readonly fontSizeIncisos = this.store.fontSizeIncisos;
  readonly fontSizeFirmas = this.store.fontSizeFirmas;
  readonly cierreCertificacionText = this.store.cierreCertificacionText;
  readonly fontSizeCierreCert = this.store.fontSizeCierreCert;
  readonly espacioFirmas = this.store.espacioFirmas;
  readonly lineSpacing = this.store.lineSpacing;

  // Factura seleccionada activa (Delegado al Store)
  readonly activeInvoice = this.store.activeInvoice;

  // --- Métodos de Acción delegados al Store ---
  onPatternsChanged(newPatterns: PatronesExtraccion): void {
    this.store.onPatternsChanged(newPatterns);
  }

  onFilesSelected(files: File[]): void {
    this.store.onFilesSelected(files);
  }

  onInvoiceUpdated(updatedInvoice: Factura): void {
    this.store.onInvoiceUpdated(updatedInvoice);
  }

  onInvoiceSelected(id: string): void {
    this.store.onInvoiceSelected(id);
  }

  onInvoiceAdded(): void {
    this.store.onInvoiceAdded();
  }

  onInvoiceDeleted(id: string): void {
    this.store.onInvoiceDeleted(id);
  }

  onAttachPdfToActive(file: File): void {
    this.store.onAttachPdfToActive(file);
  }

  resetAll(): void {
    this.store.resetAll();
  }

  onCierreCertTextChange(val: string): void {
    this.store.onCierreCertTextChange(val);
  }
}
