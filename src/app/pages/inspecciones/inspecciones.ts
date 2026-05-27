import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Inspeccion {
  id: string;
  codigo: string;
  solicitante: string;
  motivo: string;
  fechaProgramada: string;
  inspector: string;
  estado: 'Pendiente' | 'En Proceso' | 'Realizada' | 'Cancelada';
  direccion: string;
}

@Component({
  selector: 'app-inspecciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 w-full p-6 text-slate-100 flex flex-col gap-6">
      
      <!-- Encabezado de la página -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 shrink-0">
        <div>
          <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span class="w-2.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full inline-block"></span>
            Control de Inspecciones Oculares
          </h2>
          <p class="text-xs text-slate-400 mt-1">Gestión, programación y seguimiento de inspecciones de campo municipales</p>
        </div>
        <button 
          (click)="crearInspeccion()"
          class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Inspección
        </button>
      </div>

      <!-- Tarjetas de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408 9-9" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Registradas</p>
            <h3 class="text-xl font-bold mt-0.5">{{ inspecciones().length }}</h3>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendientes</p>
            <h3 class="text-xl font-bold mt-0.5">{{ getCountByEstado('Pendiente') }}</h3>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15v-2.25M3 14.25V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v4.5m-18 0h18" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En Proceso</p>
            <h3 class="text-xl font-bold mt-0.5">{{ getCountByEstado('En Proceso') }}</h3>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Realizadas</p>
            <h3 class="text-xl font-bold mt-0.5">{{ getCountByEstado('Realizada') }}</h3>
          </div>
        </div>
      </div>

      <!-- Filtro y Listado principal -->
      <div class="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </div>
            <input 
              type="text" 
              [ngModel]="filtroTexto()"
              (ngModelChange)="filtroTexto.set($event)"
              placeholder="Buscar por solicitante, motivo, inspector..."
              class="w-full ps-10 pe-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-slate-500 uppercase">Estado:</span>
            <select 
              [ngModel]="filtroEstado()"
              (ngModelChange)="filtroEstado.set($event)"
              class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-all cursor-pointer font-semibold"
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Realizada">Realizadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        <!-- Tabla/Listado -->
        <div class="flex-1 overflow-y-auto pr-1">
          @if (inspeccionesFiltradas().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-center p-8">
              <div class="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 border border-slate-800/80 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-slate-400">No se encontraron inspecciones</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-sm">Prueba ajustando los filtros o crea una nueva solicitud de inspección ocular.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-4">Código</th>
                    <th class="py-3 px-4">Solicitante</th>
                    <th class="py-3 px-4">Motivo / Asunto</th>
                    <th class="py-3 px-4">Ubicación / Dirección</th>
                    <th class="py-3 px-4">Inspector</th>
                    <th class="py-3 px-4">Fecha Prog.</th>
                    <th class="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40 text-xs">
                  @for (inspeccion of inspeccionesFiltradas(); track inspeccion.id) {
                    <tr class="hover:bg-slate-950/40 transition-colors group">
                      <td class="py-3.5 px-4 font-mono font-bold text-indigo-400">{{ inspeccion.codigo }}</td>
                      <td class="py-3.5 px-4 font-semibold text-slate-200">{{ inspeccion.solicitante }}</td>
                      <td class="py-3.5 px-4 text-slate-300 max-w-xs truncate" [title]="inspeccion.motivo">
                        {{ inspeccion.motivo }}
                      </td>
                      <td class="py-3.5 px-4 text-slate-400 max-w-xs truncate" [title]="inspeccion.direccion">
                        {{ inspeccion.direccion }}
                      </td>
                      <td class="py-3.5 px-4 text-slate-300">{{ inspeccion.inspector }}</td>
                      <td class="py-3.5 px-4 text-slate-400">{{ inspeccion.fechaProgramada }}</td>
                      <td class="py-3.5 px-4">
                        <div class="flex justify-center">
                          <span 
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            [class.bg-yellow-500/10]="inspeccion.estado === 'Pendiente'"
                            [class.text-yellow-400]="inspeccion.estado === 'Pendiente'"
                            [class.bg-blue-500/10]="inspeccion.estado === 'En Proceso'"
                            [class.text-blue-400]="inspeccion.estado === 'En Proceso'"
                            [class.bg-emerald-500/10]="inspeccion.estado === 'Realizada'"
                            [class.text-emerald-400]="inspeccion.estado === 'Realizada'"
                            [class.bg-red-500/10]="inspeccion.estado === 'Cancelada'"
                            [class.text-red-400]="inspeccion.estado === 'Cancelada'"
                          >
                            {{ inspeccion.estado }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class InspeccionesComponent {
  readonly filtroTexto = signal<string>('');
  readonly filtroEstado = signal<string>('Todos');

  readonly inspecciones = signal<Inspeccion[]>([
    {
      id: '1',
      codigo: 'IO-2026-001',
      solicitante: 'Carlos Humberto Pérez',
      motivo: 'Verificación de linderos por construcción de muro perimetral',
      fechaProgramada: '28/05/2026',
      inspector: 'Arq. Luis Arriola',
      estado: 'Pendiente',
      direccion: 'Sector 3, Lote 45, Aldea El Tablón'
    },
    {
      id: '2',
      codigo: 'IO-2026-002',
      solicitante: 'María del Carmen Santos',
      motivo: 'Evaluación de daños estructurales en vivienda por deslave',
      fechaProgramada: '27/05/2026',
      inspector: 'Ing. Byron Juárez',
      estado: 'En Proceso',
      direccion: 'Caserío La Reforma, Zona 2'
    },
    {
      id: '3',
      codigo: 'IO-2026-003',
      solicitante: 'Inversiones y Proyectos S.A.',
      motivo: 'Inspección de factibilidad de drenajes para nueva lotificación',
      fechaProgramada: '25/05/2026',
      inspector: 'Ing. Byron Juárez',
      estado: 'Realizada',
      direccion: 'Finca Las Margaritas, Km. 45 Ruta Nacional'
    },
    {
      id: '4',
      codigo: 'IO-2026-004',
      solicitante: 'Juan Alberto Gómez',
      motivo: 'Denuncia por obstrucción de paso de servidumbre',
      fechaProgramada: '24/05/2026',
      inspector: 'Arq. Luis Arriola',
      estado: 'Realizada',
      direccion: 'Aldea Las Cruces, Sector Central'
    }
  ]);

  readonly inspeccionesFiltradas = computed(() => {
    const list = this.inspecciones();
    const texto = this.filtroTexto().toLowerCase().trim();
    const estado = this.filtroEstado();

    return list.filter(item => {
      const matchTexto = !texto ||
        item.solicitante.toLowerCase().includes(texto) ||
        item.motivo.toLowerCase().includes(texto) ||
        item.direccion.toLowerCase().includes(texto) ||
        item.inspector.toLowerCase().includes(texto) ||
        item.codigo.toLowerCase().includes(texto);

      const matchEstado = estado === 'Todos' || item.estado === estado;

      return matchTexto && matchEstado;
    });
  });

  crearInspeccion(): void {
    const nombres = ['Roberto Alonzo', 'Clara Luz Méndez', 'Esteban Gutiérrez', 'Sandra Leticia Chaj'];
    const motivos = [
      'Inspección ocular para licencia de comercio',
      'Verificación de corte de árboles peligroso en vía pública',
      'Inspección ambiental por descarga de aguas residuales',
      'Inspección de alineación municipal para aceras'
    ];
    const direcciones = [
      'Zona 1, Barrio El Centro',
      'Aldea Chichicastenango, Sector Sur',
      'Cantón Las Casas, Avenida Principal',
      'Residenciales San José, Lote 12'
    ];
    const inspectores = ['Arq. Luis Arriola', 'Ing. Byron Juárez', 'Téc. Fernando Ruiz'];

    const rng = Math.floor(Math.random() * 4);
    const newInspeccion: Inspeccion = {
      id: Math.random().toString(36).substring(2, 9),
      codigo: `IO-2026-00${this.inspecciones().length + 1}`,
      solicitante: nombres[rng],
      motivo: motivos[rng],
      fechaProgramada: new Date(Date.now() + 86400000 * 2).toLocaleDateString('es-GT'),
      inspector: inspectores[Math.floor(Math.random() * inspectores.length)],
      estado: 'Pendiente',
      direccion: direcciones[rng]
    };

    this.inspecciones.update(list => [newInspeccion, ...list]);
  }

  getCountByEstado(estado: string): number {
    return this.inspecciones().filter(i => i.estado === estado).length;
  }
}
