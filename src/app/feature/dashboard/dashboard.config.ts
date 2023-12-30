/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';

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
    name: 'Supply chain',
    class: 'normal-column',
    sortKey: 'name',
  },
  {
    name: 'Number of tiers',
    class: 'normal-column',
    sortKey: 'created_on',
  },
  {
    name: 'Maximum chain length (Km)',
    class: 'large-column',
    sortKey: 'length',
  },
  {
    name: 'Companies',
    class: 'normal-column',
    sortKey: 'companies',
  },
  {
    name: 'Farmers',
    class: 'normal-column',
    sortKey: 'farmers',
  },
  {
    name: 'Chain complexity',
    class: 'large-column',
    sortKey: 'complexity',
  },
];
