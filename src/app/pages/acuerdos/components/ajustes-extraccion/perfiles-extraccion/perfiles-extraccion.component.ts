import { Component, ChangeDetectionStrategy, input, model, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatronesExtraccion } from '../../../interfaces/patrones-extraccion.interface';
import { PerfilGuardado } from '../../../interfaces/perfil-guardado.interface';
import { detectActiveProfile } from '../ajustes-extraccion.helper';

@Component({
  selector: 'app-perfiles-extraccion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfiles-extraccion.component.html'
})
export class PerfilesExtraccionComponent {
  readonly defaultPatterns = input.required<PatronesExtraccion>();
  readonly editablePatterns = model.required<PatronesExtraccion>();
  readonly patternsChange = output<PatronesExtraccion>();

  protected readonly savedProfiles = signal<PerfilGuardado[]>([]);
  protected readonly selectedProfileName = signal<string>('Por defecto');
  protected readonly newProfileName = signal<string>('');
  protected readonly showSaveAsNewForm = signal<boolean>(false);

  constructor() {
    this.loadProfiles();

    // Sincronizar el nombre del perfil activo cuando cambien los patrones editables
    effect(() => {
      const current = this.editablePatterns();
      const active = detectActiveProfile(current, this.savedProfiles(), this.defaultPatterns());
      this.selectedProfileName.set(active);
    });
  }

  private loadProfiles(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('invoice_saved_formats_v1');
      if (stored) {
        try {
          const profiles = JSON.parse(stored) as PerfilGuardado[];
          this.savedProfiles.set(profiles);
        } catch (e) {
          console.error('Error loading profiles from localStorage', e);
        }
      }
    }
  }

  private saveProfilesToStorage(profiles: PerfilGuardado[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('invoice_saved_formats_v1', JSON.stringify(profiles));
    }
    this.savedProfiles.set(profiles);
  }

  protected selectProfile(name: string): void {
    if (name === 'Por defecto') {
      const defaults = { ...this.defaultPatterns() };
      this.editablePatterns.set(defaults);
      this.selectedProfileName.set('Por defecto');
      this.patternsChange.emit(defaults);
    } else {
      const profile = this.savedProfiles().find(p => p.name === name);
      if (profile) {
        const patterns = { ...profile.patterns };
        this.editablePatterns.set(patterns);
        this.selectedProfileName.set(profile.name);
        this.patternsChange.emit(patterns);
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
        return { name: p.name, patterns: { ...this.editablePatterns() } };
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
          return { name: p.name, patterns: { ...this.editablePatterns() } };
        }
        return p;
      });
      this.saveProfilesToStorage(updatedProfiles);
      this.selectedProfileName.set(name);
    } else {
      const updatedProfiles = [...profiles, { name, patterns: { ...this.editablePatterns() } }];
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
}
