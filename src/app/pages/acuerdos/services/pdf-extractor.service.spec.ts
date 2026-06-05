import { vi } from 'vitest';

vi.mock('pdfjs-dist', () => {
  return {
    GlobalWorkerOptions: {
      workerSrc: ''
    },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: () => Promise.resolve({
          getTextContent: () => Promise.resolve({
            items: [{ str: 'Mocked PDF Content Line 1' }]
          })
        })
      })
    })
  };
});

import { TestBed } from '@angular/core/testing';
import { PdfExtractorService } from './pdf-extractor.service';

describe('PdfExtractorService - PDF Text Extraction', () => {
  let service: PdfExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfExtractorService]
    });
    service = TestBed.inject(PdfExtractorService);
  });

  it('should call pdfjsLib.getDocument and return extracted text', async () => {
    const dummyFile = new File([''], 'dummy.pdf', { type: 'application/pdf' });
    const text = await service.extractText(dummyFile);
    expect(text).toContain('Mocked PDF Content Line 1');
  });
});
