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
});
