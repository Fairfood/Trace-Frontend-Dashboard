/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listingRowSelection',
  pure: false, // Ensure the pipe is not pure to handle dynamic data changes,
  standalone: true,
})
export class ListingRowSelectionPipe implements PipeTransform {
  transform(selectedRows: any[], row: any): boolean {
    if (selectedRows?.length) {
      return selectedRows.some(
        (item: any) => item.itemId === row.itemId && row.select
      );
    }
    return false;
  }
}
