/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListingInfoService {
  /**
   * Total quantity of selected items/stocks
   */
  getSelectedQuantity(selectedItems: any[]): number {
    const total = selectedItems.reduce(
      (acc, obj) => acc + +obj.quantityNeeded,
      0
    );
    return total.toFixed(2);
  }
}
