import { ITabItem } from 'src/app/shared/configs/app.model';
import { ItabItem } from '../trace/trace.config';

export const TRACE_TEMPLATE: ITabItem[] = [
  {
    id: 'upload',
    name: 'Upload/Create template',
    description: 'Add template for multiple farmers',
    active: true,
  },
  {
    id: 'verification',
    name: 'Upload/verification',
    description: 'Upload excel template for verification',
    active: false,
  },
  {
    id: 'summary',
    name: 'Receive Summary',
    description: 'Summary of transactions',
    active: false,
  },
];

export const CUSTOM_TEMPLATE: ITabItem[] = [
  {
    id: 'upload',
    name: 'Upload/Create template',
    description: 'Add template for multiple farmers',
    active: true,
  },
  {
    id: 'linkFields',
    name: 'Link fields',
    description: 'Link fields to the template',
    active: true,
  },
  {
    id: 'verification',
    name: 'Upload/verification',
    description: 'Upload excel template for verification',
    active: false,
  },
  {
    id: 'summary',
    name: 'Receive Summary',
    description: 'Summary of transactions',
    active: false,
  },
];

export const getTemplateTabs = (type: string) => {
  if (type === 'trace') {
    return TRACE_TEMPLATE.map((item: ItabItem) => {
      return {
        ...item,
        active: item.id === 'upload',
      };
    });
  }
  return CUSTOM_TEMPLATE.map((item: ItabItem) => {
    return {
      ...item,
      active: ['upload', 'linkFields'].includes(item.id),
    };
  });
};
