import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('@app/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'nomina',
    loadComponent: () => import('@app/modules/nomina/nomina.module').then(m => m.NominaModule)
  }
];

