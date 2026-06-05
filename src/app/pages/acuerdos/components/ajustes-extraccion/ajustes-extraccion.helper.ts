import { PatronesExtraccion } from '../../interfaces/patrones-extraccion.interface';
import { PerfilGuardado } from '../../interfaces/perfil-guardado.interface';

export function arePatternsEqual(p1: PatronesExtraccion, p2: PatronesExtraccion): boolean {
  return p1.dte === p2.dte &&
         p1.serie === p2.serie &&
         p1.numero === p2.numero &&
         p1.fecha === p2.fecha &&
         p1.establecimiento === p2.establecimiento &&
         p1.direccion === p2.direccion &&
         p1.dueno === p2.dueno;
}

export function detectActiveProfile(
  currentPatterns: PatronesExtraccion,
  profiles: PerfilGuardado[],
  defaultPatterns: PatronesExtraccion
): string {
  if (arePatternsEqual(currentPatterns, defaultPatterns)) {
    return 'Por defecto';
  }
  for (const profile of profiles) {
    if (arePatternsEqual(currentPatterns, profile.patterns)) {
      return profile.name;
    }
  }
  return 'Personalizado';
}

export function testPattern(text: string, pattern: string): string {
  if (!text || !pattern) return 'Sin datos';

  try {
    const regex = new RegExp(pattern, 'i');
    const match = text.match(regex);
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
