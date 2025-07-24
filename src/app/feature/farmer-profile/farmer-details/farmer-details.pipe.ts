/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformOptions',
  standalone: true,
})
export class TransformDropdownOptions implements PipeTransform {
  transform(type: string, vm: any): any {
    return vm[type];
  }
}
