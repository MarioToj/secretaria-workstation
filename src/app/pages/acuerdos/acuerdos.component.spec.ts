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

import { TestBed } from '@angular/core/testing';
import { AcuerdosComponent } from './acuerdos.component';
import { ExtractorPdfService } from './services/extractor-pdf.service';
import { AnalizadorFacturaService } from './services/analizador-factura.service';

describe('AcuerdosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcuerdosComponent],
      providers: [ExtractorPdfService, AnalizadorFacturaService]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AcuerdosComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should start with an empty invoice list', () => {
    const fixture = TestBed.createComponent(AcuerdosComponent);
    const component = fixture.componentInstance;
    expect(component.facturas().length).toBe(0);
  });

  it('should show clear confirmation modal when resetAll is called with invoices', () => {
    const fixture = TestBed.createComponent(AcuerdosComponent);
    const component = fixture.componentInstance;
    
    component.onInvoiceAdded();
    fixture.detectChanges();
    
    expect(component.facturas().length).toBe(1);
    
    component.resetAll();
    fixture.detectChanges();
    
    expect(component.mostrarConfirmacionLimpiar()).toBe(true);
  });

  it('should show exit confirmation modal and return a pending promise when canDeactivate is called with invoices', () => {
    const fixture = TestBed.createComponent(AcuerdosComponent);
    const component = fixture.componentInstance;
    
    component.onInvoiceAdded();
    fixture.detectChanges();
    
    const canDeact = component.canDeactivate();
    expect(canDeact).toBeInstanceOf(Promise);
    expect(component.mostrarConfirmacionSalida()).toBe(true);
  });
});
