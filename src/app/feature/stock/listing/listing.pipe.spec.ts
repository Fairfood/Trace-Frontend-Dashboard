/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListingRowSelectionPipe } from './listing.pipe';

describe('ListingRowSelectionPipe', () => {
  let pipe: ListingRowSelectionPipe;

  beforeEach(() => {
    pipe = new ListingRowSelectionPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if the row should be selected', () => {
    const selectedRows = [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }];
    const row = { itemId: 2, select: true };

    const result = pipe.transform(selectedRows, row);

    expect(result).toBe(true);
  });

  it('should return false if the row should not be selected', () => {
    const selectedRows = [{ itemId: 1 }, { itemId: 3 }];
    const row = { itemId: 2, select: true };

    const result = pipe.transform(selectedRows, row);

    expect(result).toBe(false);
  });

  it('should return false if selectedRows is empty', () => {
    const selectedRows: any[] = [];
    const row = { itemId: 2, select: true };

    const result = pipe.transform(selectedRows, row);

    expect(result).toBe(false);
  });

  it('should return false if row.select is false', () => {
    const selectedRows = [{ itemId: 2 }];
    const row = { itemId: 2, select: false };

    const result = pipe.transform(selectedRows, row);

    expect(result).toBe(false);
  });
});
