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
import { PdfParserService } from './pdf-parser.service';

describe('PdfParserService - SAT FEL Invoice Parsing', () => {
  let service: PdfParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfParserService]
    });
    service = TestBed.inject(PdfParserService);
  });

  it('should extract correct fields from the user provided SAT FEL invoice text', () => {
    const rawText = `Factura Pequeño Contribuyente  1  JESÚS FRANCISCO, LEMUS CORDERO   NÚMERO DE AUTORIZACIÓN: Nit Emisor: 80224881   347F6AEF-CDE9-4C44-BFDA-97D319AC0BE8 FRANK EVENTS   Serie: 347F6AEF Número de DTE: 3454618692 4 AVENIDA 1-24 , Zona 4, Chimaltenango, CHIMALTENANGO   Numero Acceso:  NIT Receptor: 6666396   Fecha y hora de emision: 15-jul-2025 14:43:16 Nombre Receptor: MUNICIPALIDAD VILLA DE JOYABAJ   Fecha y hora de certificación: 15-jul-2025 14:43:17 Dirección comprador: CIUDAD   Moneda: GTQ  .  #No   B/S   Cantidad   Descripcion   P. Unitario con IVA (Q)   Descuentos (Q)   Total (Q)   Impuestos 1   Servicio   6   Vestuario y maquillaje para las candidatas que participarán en el certamen de señorita Joyabaj 2025-2026 1,800.00   0.00   10,800.00 2   Servicio   1   Preparación de coreografía y pasarela para las candidatas que participarán en el certamen de señorita Joyabaj 2025-2026 5,000.00   0.00   5,000.00 TOTALES:   0.00   15,800.00 * No genera derecho a crédito fiscal Datos del certificador Superintendencia de Administracion Tributaria NIT: 16693949  "Contribuyendo por el país que todos queremos"`;

    const parsed = service.parseInvoice(rawText);

    expect(parsed.dueno).toBe('JESÚS FRANCISCO, LEMUS CORDERO');
    expect(parsed.establecimiento).toBe('FRANK EVENTS');
    expect(parsed.serie).toBe('347F6AEF');
    expect(parsed.dte).toBe('3454618692');
    expect(parsed.fecha).toBe('15 de julio de 2025');
    expect(parsed.direccion).toBe('4 AVENIDA 1-24 , Zona 4, Chimaltenango, CHIMALTENANGO');
    
    // Check products
    expect(parsed.productos.length).toBe(2);
    expect(parsed.productos[0].cantidad).toBe(6);
    expect(parsed.productos[0].descripcion).toBe('Vestuario y maquillaje para las candidatas que participarán en el certamen de señorita Joyabaj 2025-2026');
    expect(parsed.productos[0].precioUnitario).toBe(1800.00);

    expect(parsed.productos[1].cantidad).toBe(1);
    expect(parsed.productos[1].descripcion).toBe('Preparación de coreografía y pasarela para las candidatas que participarán en el certamen de señorita Joyabaj 2025-2026');
    expect(parsed.productos[1].precioUnitario).toBe(5000.00);

    expect(parsed.total).toBe(15800.00);
  });

  it('should extract correct fields from KEVIN AARÓN / MULTISERVICIOS "GAMAN SAT FEL invoice text', () => {
    const rawText = `Factura Pequeño Contribuyente  1  KEVIN AARÓN , GIRÓN CARRASCOZA   NÚMERO DE AUTORIZACIÓN: Nit Emisor: 87499045   3DB011BA-6DF0-4D74-93FD-A685C48A4D9E MULTISERVICIOS "GAMAN   Serie: 3DB011BA Número de DTE: 1844465012 2 CALLE 3-83 , Zona 6, SANTA CRUZ DEL QUICHÉ, QUICHÉ   Numero Acceso:  NIT Receptor: 6666396   Fecha y hora de emision: 02-jul-2025 10:12:30 Nombre Receptor: MUNICIPALIDAD VILLA DE JOYABAJ   Fecha y hora de certificación: 02-jul-2025 10:12:31 Dirección comprador: CIUDAD   Moneda: GTQ  .  #No   B/S   Cantidad   Descripcion   P. Unitario con IVA (Q)   Descuentos (Q)   Total (Q)   Impuestos 1   Servicio   1   Por sesiones de fotos a candidatas a señorita Joyabaj 2025-2026   3,700.00   0.00   3,700.00 TOTALES:   0.00   3,700.00 * No genera derecho a crédito fiscal Datos del certificador Superintendencia de Administracion Tributaria NIT: 16693949  "Contribuyendo por el país que todos queremos"`;

    const parsed = service.parseInvoice(rawText);

    expect(parsed.dueno).toBe('KEVIN AARÓN , GIRÓN CARRASCOZA');
    expect(parsed.establecimiento).toBe('MULTISERVICIOS "GAMAN');
    expect(parsed.serie).toBe('3DB011BA');
    expect(parsed.dte).toBe('1844465012');
    expect(parsed.fecha).toBe('2 de julio de 2025');
    expect(parsed.direccion).toBe('2 CALLE 3-83 , Zona 6, SANTA CRUZ DEL QUICHÉ, QUICHÉ');
    
    // Check products
    expect(parsed.productos.length).toBe(1);
    expect(parsed.productos[0].cantidad).toBe(1);
    expect(parsed.productos[0].descripcion).toBe('Por sesiones de fotos a candidatas a señorita Joyabaj 2025-2026');
    expect(parsed.productos[0].precioUnitario).toBe(3700.00);

    expect(parsed.total).toBe(3700.00);
  });
});

import { getClosestPastWednesday, dateToSpanishWords, dateToSpanishCertDate } from '../utils/number-to-words.util';

describe('Date Spanish Conversion Utilities', () => {
  it('should format a date in Spanish long words format', () => {
    const d = new Date(2025, 2, 19); // 19 de marzo de 2025
    expect(dateToSpanishWords(d)).toBe('diecinueve de marzo del año dos mil veinticinco');
  });

  it('should format a date in Spanish certification uppercase format', () => {
    const d = new Date(2025, 2, 24); // 24 de marzo de 2025
    expect(dateToSpanishCertDate(d)).toBe('VEINTICUATRO DÍAS DEL MES DE MARZO DEL AÑO DOS MIL VEINTICINCO');
  });

  it('should find the closest past Wednesday', () => {
    // 2026-05-25 (Monday) -> Closest past Wednesday should be 2026-05-20 (Wednesday)
    const d1 = new Date(2026, 4, 25);
    const wed1 = getClosestPastWednesday(d1);
    expect(wed1.getDate()).toBe(20);
    expect(wed1.getMonth()).toBe(4); // May

    // 2026-05-27 (Wednesday) -> Closest past Wednesday should be 2026-05-27
    const d2 = new Date(2026, 4, 27);
    const wed2 = getClosestPastWednesday(d2);
    expect(wed2.getDate()).toBe(27);
  });
});
