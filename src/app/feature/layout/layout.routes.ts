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
        loadChildren: () => import('../dashboard').then(d => d.DashboardModule),
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
          import('../company-profile/company-profile.component').then(
            c => c.CompanyProfileComponent
          ),
      },
      {
        path: 'company-profile/:companyId',
        loadComponent: () =>
          import('../company-profile/company-profile.component').then(
            c => c.CompanyProfileComponent
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../transactions/transactions.component').then(
            t => t.TransactionsComponent
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
          import('../stock/stock.module').then(s => s.StockModule),
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
        loadChildren: () =>
          import('../farmer-profile/farmer-profile.module').then(
            f => f.FarmerProfileModule
          ),
      },
      {
        path: 'template-upload/:id',
        loadChildren: () =>
          import(
            '../dynamic-template-upload/dynamic-template-upload.module'
          ).then(d => d.DynamicTemplateUploadModule),
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
