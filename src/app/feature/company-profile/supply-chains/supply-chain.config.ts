import { ITableColumnHeader } from 'src/app/shared/configs/app.model';

export const CHAIN_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Supply chain',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'Company type',
    class: 'normal-column',
    sortKey: 'created_on',
  },
  {
    name: 'Companies',
    class: 'normal-column',
    sortKey: 'country',
  },
  {
    name: 'Farmers',
    class: 'normal-column',
    sortKey: 'supplyChain',
  },
];
