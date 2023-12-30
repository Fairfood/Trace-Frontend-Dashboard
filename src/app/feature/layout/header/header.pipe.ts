/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarPipe',
  pure: false,
  standalone: true,
})
export class AvatarPipe implements PipeTransform {
  transform(data: any): string {
    if (data) {
      const { first_name, last_name } = data;
      return `${first_name[0] || ''} ${last_name[0] || ''}`;
    }
    return '';
  }
}

@Pipe({
  name: 'toPositive',
  standalone: true,
})
export class ToPositivePipe implements PipeTransform {
  transform(num: number): any {
    return Math.abs(num);
  }
}
