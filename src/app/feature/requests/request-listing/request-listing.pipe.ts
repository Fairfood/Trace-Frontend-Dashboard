/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reqAvatarPipe',
  pure: false,
  standalone: true,
})
export class RequestAvatarPipe implements PipeTransform {
  transform(data: any): string {
    if (data) {
      const result = data.split(' ');
      const [first_name, last_name] = result;
      return `${(first_name && first_name[0]) || ''} ${
        (last_name && last_name[0]) || ''
      }`;
    }
    return '';
  }
}
