import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'acuerdos',
    loadComponent: () => import('./pages/acuerdos/acuerdos.component').then(m => m.AcuerdosComponent)
  },
  {
    path: 'inspecciones',
    loadComponent: () => import('./pages/inspecciones/inspecciones.component').then(m => m.InspeccionesComponent)
  },
  {
    path: '',
    redirectTo: 'acuerdos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'acuerdos'
  }
];

