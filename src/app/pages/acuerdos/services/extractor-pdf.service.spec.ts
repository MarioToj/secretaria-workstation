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
import { ExtractorPdfService } from './extractor-pdf.service';

describe('ExtractorPdfService - PDF Text Extraction', () => {
  let service: ExtractorPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtractorPdfService]
    });
    service = TestBed.inject(ExtractorPdfService);
  });

  it('should call pdfjsLib.getDocument and return extracted text', async () => {
    const dummyFile = new File([''], 'dummy.pdf', { type: 'application/pdf' });
    const text = await service.extractText(dummyFile);
    expect(text).toContain('Mocked PDF Content Line 1');
  });
});
