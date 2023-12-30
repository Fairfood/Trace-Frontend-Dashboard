/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapColumnName',
  standalone: true,
})
export class MapColumnNamePipe implements PipeTransform {
  transform(item: any, index: number): string {
    const found = item.find((element: any) => element.columnIndex === index);
    if (found) {
      return found.label;
    }
    return '';
  }
}
