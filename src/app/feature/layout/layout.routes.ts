import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

// routes
export const layout: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard').then(d => d.DashboardComponent),
      },
      {
        path: 'connections',
        loadChildren: () =>
          import('../connections/connections.module').then(
            c => c.ConnectionsModule
          ),
      },
      {
        path: 'company-profile',
        loadComponent: () =>
          import('../company-profile').then(c => c.CompanyProfileComponent),
      },
      {
        path: 'company-profile/:companyId',
        loadComponent: () =>
          import('../company-profile').then(c => c.CompanyProfileComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../transactions').then(t => t.TransactionsComponent),
      },
      {
        path: 'archive-transactions',
        loadComponent: () =>
          import('../transactions/archive-transactions').then(
            l => l.ArchiveTransactionsComponent
          ),
      },
      {
        path: 'transaction-report/:transaction/:id',
        loadChildren: () =>
          import('../transaction-report/transaction-report.module').then(
            m => m.TransactionReportModule
          ),
      },
      {
        path: 'claims',
        loadChildren: () =>
          import('../claim/claim.routes').then(m => m.clRoutes),
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('../stock/stock.routes').then(s => s.stockRoutes),
      },
      {
        path: 'requests',
        loadChildren: () =>
          import('../requests/request-listing/request-listing.module').then(
            s => s.RequestsModule
          ),
      },
      {
        path: 'farmer-profile/:id',
        loadComponent: () =>
          import('../farmer-profile').then(t => t.FarmerProfileComponent),
      },
      {
        path: 'template-upload/:id',
        loadComponent: () =>
          import('../dynamic-template-upload').then(
            d => d.DynamicTemplateUploadComponent
          ),
      },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('../user-profile/user-profile.component').then(
            t => t.UserProfileComponent
          ),
      },
    ],
  },
];
