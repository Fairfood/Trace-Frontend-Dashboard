/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@angular/common';

export const dateFilterCommon = (formValue: any) => {
  const sendFormat = 'dd/MM/yyyy';
  const showFormat = 'dd/MM/yy';
  const locale = 'en-US';

  const returnValues = {
    dateOn: '',
    dateTo: '',
    dateFrom: '',
    empty: false,
    dateEmpty: false,
    dateFilterText: '',
  };

  const { selectedType, selectedDate, start, end } = formValue;

  if (selectedType === 2) {
    if (selectedDate) {
      const dateFormatedToShow = formatDate(selectedDate, showFormat, locale);
      const dateFormatedToSend = formatDate(selectedDate, sendFormat, locale);
      returnValues.dateFilterText = 'Before: ' + dateFormatedToShow;
      returnValues.dateTo = dateFormatedToSend;
    } else {
      returnValues.empty = true;
    }
  } else {
    if (start && !end) {
      const startDateShow = formatDate(start, showFormat, locale);
      const startDateSend = formatDate(start, sendFormat, locale);
      returnValues.dateFilterText = 'From: ' + startDateShow;
      returnValues.dateFrom = startDateSend;
    } else if (start && end) {
      const startDateShow = formatDate(start, showFormat, locale);
      const startDateSend = formatDate(start, sendFormat, locale);
      const endDateShow = formatDate(end, showFormat, locale);
      const endDateSend = formatDate(end, sendFormat, locale);
      returnValues.dateFilterText = startDateShow + ' - ' + endDateShow;
      returnValues.dateFrom = startDateSend;
      returnValues.dateTo = endDateSend;
    } else {
      returnValues.empty = true;
    }
  }

  return returnValues;
};
