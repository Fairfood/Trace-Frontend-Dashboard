/* istanbul ignore file */
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './shared/guard';

export const AppRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./feature/layout').then(l => l.layout),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./feature/authentication/login').then(x => x.LoginComponent),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('./feature/authentication/verify').then(x => x.VerifyComponent),
  },
  {
    path: 'accept-member-invite',
    loadComponent: () =>
      import('./feature/authentication/invite-member').then(
        x => x.InviteMemberComponent
      ),
  },
  {
    path: 'email-notification',
    loadChildren: () =>
      import(
        './feature/authentication/email-notifications/email-notifications.routes'
      ).then(m => m.routes),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(AppRoutes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
