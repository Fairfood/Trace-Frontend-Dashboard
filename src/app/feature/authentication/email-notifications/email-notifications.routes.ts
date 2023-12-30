/* istanbul ignore file */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./').then(m => m.EmailNotificationsComponent),
  },
  {
    path: ':notification/:user/:node_id',
    loadComponent: () => import('./').then(m => m.EmailNotificationsComponent),
  },
];
