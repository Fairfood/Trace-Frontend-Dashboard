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
        loadComponent: () =>
          import('./process-stock').then(p => p.ProcessStockComponent),
      },
      {
        path: 'stock-send',
        loadComponent: () =>
          import('./process-stock').then(p => p.ProcessStockComponent),
      },
      {
        path: 'process-convert',
        loadComponent: () =>
          import('./process-stock').then(p => p.ProcessStockComponent),
      },
      {
        path: 'process-merge',
        loadComponent: () =>
          import('./process-stock').then(p => p.ProcessStockComponent),
      },
      {
        path: 'archive-stocks',
        loadComponent: () =>
          import('./listing/archive-stocks').then(
            p => p.ArchiveStocksComponent
          ),
      },
    ],
  },
];
