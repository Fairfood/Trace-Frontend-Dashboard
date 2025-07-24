/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ButtonsComponent, LoaderComponent } from 'fairfood-utils';
import { ChartDonutComponent } from 'src/app/shared/components/chart-donut';
import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import { RecentTransactionComponent } from './recent-transaction';
import { TranslateModule } from '@ngx-translate/core';

export const MAPVIEW_TABS: ICommonObj[] = [
  {
    id: 'farmer',
    name: 'Farmers',
  },
  {
    id: 'supplier',
    name: 'Suppliers',
  },
];

export const SUPPLY_CHAIN_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'supplyChain.name',
    class: 'normal-column',
    sortKey: 'name',
  },
  {
    name: 'supplyChain.noOfTiers',
    class: 'normal-column',
    sortKey: 'created_on',
  },
  {
    name: 'dashboard.thLength',
    class: 'large-column',
    sortKey: 'length',
  },
  {
    name: 'misc.companies',
    class: 'normal-column',
    sortKey: 'companies',
  },
  {
    name: 'misc.farmers',
    class: 'normal-column',
    sortKey: 'farmers',
  },
  {
    name: 'supplyChain.complexity',
    class: 'large-column',
    sortKey: 'complexity',
  },
];

export const DASH_IMPORTS = [
  CommonModule,
  LoaderComponent,
  TranslateModule,
  ButtonsComponent,
  ChartDonutComponent,
  MatProgressBarModule,
  RecentTransactionComponent,
  TranslateModule,
];
