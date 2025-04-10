import { Routes } from '@angular/router';
/* istanbul ignore next */
export const clRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./claim-list/claim-list.component').then(
        m => m.ClaimListComponent
      ),
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./claim-information/claim-information.component').then(
        m => m.ClaimInformationComponent
      ),
  },
];
