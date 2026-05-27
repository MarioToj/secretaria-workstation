import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'acuerdos',
    loadComponent: () => import('./pages/acuerdos/acuerdos').then(m => m.AcuerdosComponent)
  },
  {
    path: 'inspecciones',
    loadComponent: () => import('./pages/inspecciones/inspecciones').then(m => m.InspeccionesComponent)
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

