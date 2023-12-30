export interface IProcessButton {
  id: string;
  name: string;
  hidden: boolean;
}

export const PROCESS_BUTTONS: IProcessButton[] = [
  {
    id: 'convert',
    name: 'Convert stock',
    hidden: false,
  },
  {
    id: 'merge',
    name: 'Merge stock',
    hidden: true,
  },
  {
    id: 'remove',
    name: 'Remove stock',
    hidden: false,
  },
];
