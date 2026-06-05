import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { desactivarAcuerdosGuard } from './desactivar-acuerdos.guard';
import { AcuerdosComponent } from '../acuerdos.component';
import { ExtractorPdfService } from '../services/extractor-pdf.service';
import { AnalizadorFacturaService } from '../services/analizador-factura.service';
import { vi } from 'vitest';

vi.mock('pdfjs-dist', () => {
  return {
    GlobalWorkerOptions: {
      workerSrc: ''
    },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 0,
        getPage: () => Promise.resolve({
          getTextContent: () => Promise.resolve({ items: [] })
        })
      })
    })
  };
});

@Component({
  selector: 'app-dummy-target',
  template: '<div>Dummy Target</div>',
  standalone: true
})
class DummyTargetComponent {}

describe('desactivarAcuerdosGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AcuerdosComponent, DummyTargetComponent],
      providers: [
        ExtractorPdfService,
        AnalizadorFacturaService,
        provideRouter([
          {
            path: 'acuerdos',
            component: AcuerdosComponent,
            canDeactivate: [desactivarAcuerdosGuard]
          },
          {
            path: 'inspecciones',
            component: DummyTargetComponent
          }
        ])
      ]
    });
  });

  it('should allow navigation if there are no invoices', async () => {
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create('/acuerdos');
    const agreementsComponent = harness.routeDebugElement?.componentInstance as AcuerdosComponent;
    
    expect(agreementsComponent.facturas().length).toBe(0);
    
    await harness.navigateByUrl('/inspecciones');
    expect(router.url).toBe('/inspecciones');
  });

  it('should block navigation and open confirmation dialog if there are invoices', async () => {
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create('/acuerdos');
    const agreementsComponent = harness.routeDebugElement?.componentInstance as AcuerdosComponent;
    
    // Add an invoice to trigger guard
    agreementsComponent.onInvoiceAdded();
    harness.fixture.detectChanges();
    expect(agreementsComponent.facturas().length).toBe(1);
    
    // Navigate away, it should return a pending promise
    const navigationPromise = harness.navigateByUrl('/inspecciones');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // The url should still be /acuerdos because it is blocked/pending confirmation
    expect(router.url).toBe('/acuerdos');
    expect(agreementsComponent.mostrarConfirmacionSalida()).toBe(true);
    
    // Simulate confirming the navigation
    agreementsComponent.onConfirmarSalida(true);
    
    // Wait for the navigation to finish
    await navigationPromise;
    expect(router.url).toBe('/inspecciones');
  });

  it('should cancel navigation if user declines to leave', async () => {
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create('/acuerdos');
    const agreementsComponent = harness.routeDebugElement?.componentInstance as AcuerdosComponent;
    
    agreementsComponent.onInvoiceAdded();
    harness.fixture.detectChanges();
    expect(agreementsComponent.facturas().length).toBe(1);
    
    const navigationPromise = harness.navigateByUrl('/inspecciones');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(router.url).toBe('/acuerdos');
    expect(agreementsComponent.mostrarConfirmacionSalida()).toBe(true);
    
    // Simulate declining the navigation
    agreementsComponent.onConfirmarSalida(false);
    
    await navigationPromise;
    // URL remains /acuerdos because navigation was cancelled
    expect(router.url).toBe('/acuerdos');
    expect(agreementsComponent.mostrarConfirmacionSalida()).toBe(false);
  });
});
