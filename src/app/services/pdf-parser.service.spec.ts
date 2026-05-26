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

  it('should extract correct fields from Vicente Salazar Illescas invoice text (9-digit DTE and quantity 1)', () => {
    const rawText = `Factura  1  VICENTE , SALAZAR ILLESCAS   NÚMERO DE AUTORIZACIÓN: Nit Emisor: 2030705   A100DE2F-2314-4FCB-9CBD-27AFF11F9920 PRODUCCIONES MARIMBA MARIA CONCEPCION Y SHIGUALITA   Serie: A100DE2F Número de DTE: 588533707 4 CALLE 1-31, Zona 5, CIUDAD VIEJA, SACATEPÉQUEZ   Numero Acceso:  NIT Receptor: 6666396   Fecha y hora de emision: 24-jul-2025 10:03:56 Nombre Receptor: MUNICIPALIDAD VILLA DE JOYABAJ   Fecha y hora de certificación: 24-jul-2025 10:03:57 Moneda: GTQ  .  #No   B/S   Cantidad   Descripcion   P. Unitario con IVA (Q)   Descuentos (Q)   Total (Q)   Impuestos 1   Servicio   1   Por alquiler de audio y escenario en la plaza central de Joyabaj Quiché, el día 09 de agosto 2025 municipalidad de Joyabaj. 15,000.00   0.00   15,000.00   IVA   1,607.142857  TOTALES:   0.00   15,000.00   IVA   1,607.142857  * Sujeto a retención definitiva ISR Datos del certificador Superintendencia de Administracion Tributaria NIT: 16693949  "Contribuyendo por el país que todos queremos"`;

    const parsed = service.parseInvoice(rawText);

    expect(parsed.dueno).toBe('VICENTE , SALAZAR ILLESCAS');
    expect(parsed.establecimiento).toBe('PRODUCCIONES MARIMBA MARIA CONCEPCION Y SHIGUALITA');
    expect(parsed.serie).toBe('A100DE2F');
    expect(parsed.dte).toBe('588533707');
    expect(parsed.fecha).toBe('24 de julio de 2025');
    expect(parsed.direccion).toBe('4 CALLE 1-31, Zona 5, CIUDAD VIEJA, SACATEPÉQUEZ');
    
    // Check products
    expect(parsed.productos.length).toBe(1);
    expect(parsed.productos[0].cantidad).toBe(1);
    expect(parsed.productos[0].descripcion).toBe('Por alquiler de audio y escenario en la plaza central de Joyabaj Quiché, el día 09 de agosto 2025 municipalidad de Joyabaj.');
    expect(parsed.productos[0].precioUnitario).toBe(15000.00);

    expect(parsed.total).toBe(15000.00);

    // Concept detail formatting check (removes trailing dot, removes 'cada uno' since qty is 1, preserves casing)
    expect(service.generateConceptDetail(parsed.productos)).toBe('1 Por alquiler de audio y escenario en la plaza central de Joyabaj Quiché, el día 09 de agosto 2025 municipalidad de Joyabaj, con un valor de quince mil quetzales (Q.15,000.00)');
  });

  it('should detect corporate owner (S.A.) and assign "de" treatment', () => {
    const rawText = `Factura  1  CONSTRUCTORA MILDER, S.A.   NÚMERO DE AUTORIZACIÓN: Nit Emisor: 62004506   DC01E62D-9E46-4839-8DAC-8C82F7851BEF CONSTRUCTORA MILDER   Serie: DC01E62D Número de DTE: 2655406137 BARRIO LA DEMOCRACIA, JOYABAJ, QUICHÉ   Numero Acceso:  NIT Receptor: 6666396   Fecha y hora de emision: 25-feb-2026 12:41:12 Nombre Receptor: MUNICIPALIDAD VILLA DE JOYABAJ   Fecha y hora de certificación: 25-feb-2026 12:41:13 Moneda: GTQ`;
    const parsed = service.parseInvoice(rawText);
    expect(parsed.dueno).toBe('CONSTRUCTORA MILDER, S.A.');
    expect(parsed.tratamientoDueno).toBe('de');
  });

  it('should extract correct fields from Rosa Angelina Castro Pol invoice text (two discount columns)', () => {
    const rawText = `Factura  1  ROSA ANGELINA , CASTRO POL   NÚMERO DE AUTORIZACIÓN: Nit Emisor: 62004506   DC01E62D-9E46-4839-8DAC-8C82F7851BEF CONSTRUCTORA MILDER   Serie: DC01E62D Número de DTE: 2655406137 BARRIO LA DEMOCRACIA, JOYABAJ, QUICHÉ   Numero Acceso:  NIT Receptor: 6666396   Fecha y hora de emision: 25-feb-2026 12:41:12 Nombre Receptor: MUNICIPALIDAD VILLA DE JOYABAJ   Fecha y hora de certificación: 25-feb-2026 12:41:13 Moneda: GTQ  .  #No   B/S   Cantidad   Descripcion   P. Unitario con IVA (Q)   Descuentos (Q)   Otros Descuentos(Q)   Total (Q)   Impuestos 1   Bien   56   TUBOS PVC DE 21/2 DE 250 PSI   225.00   0.00   0.00   12,600.00   IVA   1,350.000000  2   Bien   80   TUBOS PVC DE 2 250 PSI   150.00   0.00   0.00   12,000.00   IVA   1,285.714286  TOTALES:   0.00   0.00   24,600.00   IVA   2,635.714286  * Sujeto a pagos trimestrales ISR Datos del certificador Superintendencia de Administracion Tributaria NIT: 16693949`;

    const parsed = service.parseInvoice(rawText);

    expect(parsed.dueno).toBe('ROSA ANGELINA , CASTRO POL');
    expect(parsed.establecimiento).toBe('CONSTRUCTORA MILDER');
    expect(parsed.serie).toBe('DC01E62D');
    expect(parsed.dte).toBe('2655406137');
    expect(parsed.fecha).toBe('25 de febrero de 2026');
    expect(parsed.direccion).toBe('BARRIO LA DEMOCRACIA, JOYABAJ, QUICHÉ');
    
    // Check products
    expect(parsed.productos.length).toBe(2);
    expect(parsed.productos[0].cantidad).toBe(56);
    expect(parsed.productos[0].descripcion).toBe('TUBOS PVC DE 21/2 DE 250 PSI');
    expect(parsed.productos[0].precioUnitario).toBe(225.00);

    expect(parsed.productos[1].cantidad).toBe(80);
    expect(parsed.productos[1].descripcion).toBe('TUBOS PVC DE 2 250 PSI');
    expect(parsed.productos[1].precioUnitario).toBe(150.00);

    expect(parsed.total).toBe(24600.00);
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
