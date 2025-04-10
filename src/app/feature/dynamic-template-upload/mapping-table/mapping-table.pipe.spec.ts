import { MapColumnNamePipe } from './mapping-table.pipe';

describe('MapColumnNamePipe', () => {
  let pipe: MapColumnNamePipe;

  beforeEach(() => {
    pipe = new MapColumnNamePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string if no item is provided', () => {
    const result = pipe.transform(undefined, 0);
    expect(result).toEqual('');
  });

  it('should return empty string if item does not contain element with given index', () => {
    const item = [
      { columnIndex: 1, label: 'Label 1' },
      { columnIndex: 2, label: 'Label 2' },
    ];
    const result = pipe.transform(item, 0);
    expect(result).toEqual('');
  });

  it('should return label of the element with given index', () => {
    const item = [
      { columnIndex: 1, label: 'Label 1' },
      { columnIndex: 2, label: 'Label 2' },
    ];
    const result = pipe.transform(item, 1);
    expect(result).toEqual('Label 1');
  });
});
