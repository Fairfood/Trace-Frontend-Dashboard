/* istanbul ignore file */
import { Routes } from '@angular/router';
import { StockComponent } from './stock.component';

export const stockRoutes: Routes = [
  {
    path: '',
    component: StockComponent,
    children: [
      {
        path: 'listing',
        loadComponent: () =>
          import('./listing/listing.component').then(l => l.ListingComponent),
      },
      {
        path: 'receive',
        loadChildren: () =>
          import('./process-stock/process-stock.module').then(
            m => m.ProcessStockModule
          ),
      },
      {
        path: 'stock-send',
        loadChildren: () =>
          import('./process-stock/process-stock.module').then(
            m => m.ProcessStockModule
          ),
      },
      {
        path: 'process-convert',
        loadChildren: () =>
          import('./process-stock/process-stock.module').then(
            m => m.ProcessStockModule
          ),
      },
      {
        path: 'process-merge',
        loadChildren: () =>
          import('./process-stock/process-stock.module').then(
            m => m.ProcessStockModule
          ),
      },
    ],
  },
];
