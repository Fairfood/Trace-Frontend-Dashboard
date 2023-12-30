/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'errorColumn',
  standalone: true,
})
export class ErrorColumnPipe implements PipeTransform {
  transform(item: any, key: string): boolean {
    const found = item?.errors?.find((element: any) => element.key === key);
    if (found) {
      return true;
    }
    return false;
  }
}

@Pipe({
  name: 'errorColumnMessage',
  standalone: true,
})
export class ErrorColumnMessagePipe implements PipeTransform {
  transform(item: any, key: string): string {
    const found = item?.errors?.find((element: any) => element.key === key);
    if (found) {
      return found.reason;
    }
    return '';
  }
}

@Pipe({
  name: 'stateFilter',
  standalone: true,
})
export class StateFilterPipe implements PipeTransform {
  transform(countryList: any[], countryName: string): any[] {
    if (countryName) {
      const found = countryList?.find(
        (element: any) => element.name === countryName
      );
      if (found) {
        const selectedSub = found.sub_divisions;
        const provinces = Object.keys(selectedSub).map((key: any) => {
          selectedSub[key].name = key;
          selectedSub[key].id = key;
          return selectedSub[key];
        });
        return provinces;
      }
      return [];
    } else {
      return [];
    }
  }
}
