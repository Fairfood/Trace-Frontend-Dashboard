import { ITableColumnHeader } from 'src/app/shared/configs/app.model';

export const CLAIM_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'Assigned to',
    class: 'normal-column',
    sortKey: 'assignedTo',
  },
  {
    name: 'Status',
    class: 'normal-column',
    sortKey: 'status',
  },
];
