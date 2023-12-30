import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shrink', standalone: true })
export class ShrinkPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(list: any[], index: number, activeIndex: number): boolean {
    if (list.length > 3) {
      if (
        activeIndex === 0 &&
        [0, list.length - 2, list.length - 1].includes(index) &&
        index !== activeIndex
      ) {
        return true;
      } else if (
        activeIndex !== 0 &&
        [0, 1, list.length - 1].includes(index) &&
        index !== activeIndex
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
