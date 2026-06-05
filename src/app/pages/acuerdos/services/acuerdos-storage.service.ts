import { Injectable } from '@angular/core';
import { PatronesExtraccion } from '../interfaces/patrones-extraccion.interface';

@Injectable({
  providedIn: 'root'
})
export class AcuerdosStorageService {
  loadPatterns(defaultPatterns: PatronesExtraccion): PatronesExtraccion {
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
    return { ...defaultPatterns };
  }

  savePatterns(patterns: PatronesExtraccion): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('invoice_extraction_patterns_v8', JSON.stringify(patterns));
    }
  }

  loadString(key: string, defaultValue: string): string {
    if (typeof localStorage !== 'undefined') {
      if (key === 'fontFamily') {
        const fontMigrated = localStorage.getItem('invoice_app_fontfamily_migrated_v1');
        if (!fontMigrated) {
          localStorage.setItem('invoice_app_fontFamily', 'Arial Narrow');
          localStorage.setItem('invoice_app_fontfamily_migrated_v1', 'true');
        }
      }
      const val = localStorage.getItem(`invoice_app_${key}`);
      if (val) return val;
    }
    return defaultValue;
  }

  saveString(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`invoice_app_${key}`, value);
    }
  }

  loadNum(key: string, defaultValue: number): number {
    if (typeof localStorage !== 'undefined') {
      const migrated = localStorage.getItem('invoice_app_fontsize_migrated_v11');
      if (!migrated) {
        const keys = ['fontSizeGeneral', 'fontSizeCert', 'fontSizeIncisos', 'fontSizeFirmas', 'fontSizeCierreCert'];
        keys.forEach(k => {
          const val = localStorage.getItem(`invoice_app_${k}`);
          if (val === '12' || !val) {
            localStorage.setItem(`invoice_app_${k}`, '11');
          }
        });
        localStorage.setItem('invoice_app_fontsize_migrated_v11', 'true');
      }

      const val = localStorage.getItem(`invoice_app_${key}`);
      if (val) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return defaultValue;
  }

  saveNum(key: string, value: number): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`invoice_app_${key}`, value.toString());
    }
  }
}
