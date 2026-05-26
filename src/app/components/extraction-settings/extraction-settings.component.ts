import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExtractionPatterns, PdfParserService } from '../../services/pdf-parser.service';

export interface SavedProfile {
  name: string;
  patterns: ExtractionPatterns;
}

@Component({
  selector: 'app-extraction-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './extraction-settings.component.html'
})
export class ExtractionSettingsComponent {
  private readonly parserService = inject(PdfParserService);

  // Inputs usando signal inputs (input())
  readonly rawText = input<string>('');
  readonly patterns = input<ExtractionPatterns>({
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  });

  // Outputs usando output()
  readonly patternsChange = output<ExtractionPatterns>();
  readonly close = output<void>();

  // Estado local para los inputs editables
  protected editablePatterns: ExtractionPatterns = {
    dte: '', serie: '', numero: '', fecha: '', establecimiento: '', direccion: '', dueno: ''
  };

  // Estado local para los perfiles de formato
  protected readonly savedProfiles = signal<SavedProfile[]>([]);
  protected readonly selectedProfileName = signal<string>('Por defecto');
  protected readonly newProfileName = signal<string>('');
  protected readonly showSaveAsNewForm = signal<boolean>(false);

  readonly fields: Array<{ key: keyof ExtractionPatterns; label: string }> = [
    { key: 'dte', label: 'Número de Autorización (DTE / UUID)' },
    { key: 'serie', label: 'Serie de la Factura' },
    { key: 'numero', label: 'Número de Factura' },
    { key: 'fecha', label: 'Fecha de Emisión' },
    { key: 'establecimiento', label: 'Nombre del Establecimiento / Emisor' },
    { key: 'direccion', label: 'Dirección del Establecimiento' },
    { key: 'dueno', label: 'Nombre del Dueño / Propietario' }
  ];

  constructor() {
    this.loadProfiles();

    // Sincronizar el valor inicial del input con nuestro estado editable usando un effect
    effect(() => {
      const patternsVal = this.patterns();
      if (patternsVal) {
        this.editablePatterns = { ...patternsVal };
        // Detectar perfil activo
        const active = this.detectActiveProfile(patternsVal, this.savedProfiles());
        this.selectedProfileName.set(active);
      }
    });
  }

  onPatternChange(): void {
    this.patternsChange.emit(this.editablePatterns);
    // Detectar perfil activo dinámicamente al cambiar el texto de los patrones
    const active = this.detectActiveProfile(this.editablePatterns, this.savedProfiles());
    this.selectedProfileName.set(active);
  }

  onClose(): void {
    this.close.emit();
  }

  restoreDefaults(): void {
    this.selectProfile('Por defecto');
  }

  getMatchPreview(key: keyof ExtractionPatterns): string {
    const textVal = this.rawText();
    const pattern = this.editablePatterns[key];
    if (!textVal || !pattern) return 'Sin datos';

    try {
      const regex = new RegExp(pattern, 'i');
      const match = textVal.match(regex);
      if (match) {
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            return `Coincidencia: "${match[i].trim()}"`;
          }
        }
      }
      return 'Sin coincidencias con el patrón actual';
    } catch (e) {
      return 'Sintaxis Regex Inválida';
    }
  }

  // --- Lógica del Administrador de Perfiles ---

  private loadProfiles(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('invoice_saved_formats_v1');
      if (stored) {
        try {
          const profiles = JSON.parse(stored) as SavedProfile[];
          this.savedProfiles.set(profiles);
        } catch (e) {
          console.error('Error loading profiles from localStorage', e);
        }
      }
    }
  }

  private saveProfilesToStorage(profiles: SavedProfile[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('invoice_saved_formats_v1', JSON.stringify(profiles));
    }
    this.savedProfiles.set(profiles);
  }

  protected selectProfile(name: string): void {
    if (name === 'Por defecto') {
      const defaults = { ...this.parserService.defaultPatterns };
      this.editablePatterns = { ...defaults };
      this.selectedProfileName.set('Por defecto');
      this.patternsChange.emit(defaults);
    } else {
      const profile = this.savedProfiles().find(p => p.name === name);
      if (profile) {
        this.editablePatterns = { ...profile.patterns };
        this.selectedProfileName.set(profile.name);
        this.patternsChange.emit(this.editablePatterns);
      }
    }
    this.showSaveAsNewForm.set(false);
  }

  protected saveCurrentProfile(): void {
    const currentName = this.selectedProfileName();
    if (currentName === 'Por defecto' || currentName === 'Personalizado') {
      this.showSaveAsNewForm.set(true);
      return;
    }

    const updatedProfiles = this.savedProfiles().map(p => {
      if (p.name === currentName) {
        return { name: p.name, patterns: { ...this.editablePatterns } };
      }
      return p;
    });
    this.saveProfilesToStorage(updatedProfiles);
  }

  protected saveAsNewProfile(): void {
    const name = this.newProfileName().trim();
    if (!name) return;

    if (name === 'Por defecto' || name === 'Personalizado') {
      alert('Nombre de perfil reservado. Por favor elige otro.');
      return;
    }

    const profiles = this.savedProfiles();
    const exists = profiles.some(p => p.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      if (!confirm(`El perfil "${name}" ya existe. ¿Deseas sobrescribirlo?`)) {
        return;
      }
      const updatedProfiles = profiles.map(p => {
        if (p.name.toLowerCase() === name.toLowerCase()) {
          return { name: p.name, patterns: { ...this.editablePatterns } };
        }
        return p;
      });
      this.saveProfilesToStorage(updatedProfiles);
      this.selectedProfileName.set(name);
    } else {
      const updatedProfiles = [...profiles, { name, patterns: { ...this.editablePatterns } }];
      this.saveProfilesToStorage(updatedProfiles);
      this.selectedProfileName.set(name);
    }

    this.newProfileName.set('');
    this.showSaveAsNewForm.set(false);
  }

  protected deleteProfile(): void {
    const currentName = this.selectedProfileName();
    if (currentName === 'Por defecto' || currentName === 'Personalizado') return;

    if (confirm(`¿Estás seguro de que deseas eliminar el formato "${currentName}"?`)) {
      const updatedProfiles = this.savedProfiles().filter(p => p.name !== currentName);
      this.saveProfilesToStorage(updatedProfiles);
      this.selectProfile('Por defecto');
    }
  }

  private detectActiveProfile(currentPatterns: ExtractionPatterns, profiles: SavedProfile[]): string {
    const defaultPat = this.parserService.defaultPatterns;
    if (this.arePatternsEqual(currentPatterns, defaultPat)) {
      return 'Por defecto';
    }
    for (const profile of profiles) {
      if (this.arePatternsEqual(currentPatterns, profile.patterns)) {
        return profile.name;
      }
    }
    return 'Personalizado';
  }

  private arePatternsEqual(p1: ExtractionPatterns, p2: ExtractionPatterns): boolean {
    return p1.dte === p2.dte &&
           p1.serie === p2.serie &&
           p1.numero === p2.numero &&
           p1.fecha === p2.fecha &&
           p1.establecimiento === p2.establecimiento &&
           p1.direccion === p2.direccion &&
           p1.dueno === p2.dueno;
  }
}
