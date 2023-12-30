import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconPath',
  standalone: true,
})
export class IconPathPipe implements PipeTransform {
  transform(icon: string): string {
    return `../../../assets/images/${icon}.svg`;
  }
}
