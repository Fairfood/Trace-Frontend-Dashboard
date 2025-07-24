import {
  ErrorColumnPipe,
  ErrorColumnMessagePipe,
  StateFilterPipe,
} from './template-verification.pipe';

describe('ErrorColumnPipe', () => {
  const pipe = new ErrorColumnPipe();

  it('should return true if the item has an error with the specified key', () => {
    const item = { errors: [{ key: 'someKey' }] };
    expect(pipe.transform(item, 'someKey')).toBe(true);
  });

  it('should return false if the item does not have an error with the specified key', () => {
    const item = { errors: [{ key: 'someOtherKey' }] };
    expect(pipe.transform(item, 'someKey')).toBe(false);
  });

  it('should return false if the item is null or undefined', () => {
    expect(pipe.transform(null, 'someKey')).toBe(false);
    expect(pipe.transform(undefined, 'someKey')).toBe(false);
  });
});

describe('ErrorColumnMessagePipe', () => {
  const pipe = new ErrorColumnMessagePipe();

  it('should return the error message if the item has an error with the specified key', () => {
    const item = { errors: [{ key: 'someKey', reason: 'Some error message' }] };
    expect(pipe.transform(item, 'someKey')).toBe('Some error message');
  });

  it('should return an empty string if the item does not have an error with the specified key', () => {
    const item = {
      errors: [{ key: 'someOtherKey', reason: 'Another error message' }],
    };
    expect(pipe.transform(item, 'someKey')).toBe('');
  });

  it('should return an empty string if the item is null or undefined', () => {
    expect(pipe.transform(null, 'someKey')).toBe('');
    expect(pipe.transform(undefined, 'someKey')).toBe('');
  });
});

describe('StateFilterPipe', () => {
  const pipe = new StateFilterPipe();

  it('should return an array of provinces if the countryName is provided', () => {
    const countryList = [
      { name: 'Country1', sub_divisions: { province1: {}, province2: {} } },
      { name: 'Country2', sub_divisions: { province3: {}, province4: {} } },
    ];
    const countryName = 'Country1';
    expect(pipe.transform(countryList, countryName)).toEqual([
      { name: 'province1', id: 'province1' },
      { name: 'province2', id: 'province2' },
    ]);
  });

  it('should return an empty array if the countryName is not provided', () => {
    const countryList = [
      { name: 'Country1', sub_divisions: { province1: {} } },
    ];
    expect(pipe.transform(countryList, '')).toEqual([]);
  });

  it('should return an empty array if the countryName does not match any country in the list', () => {
    const countryList = [
      { name: 'Country1', sub_divisions: { province1: {} } },
    ];
    expect(pipe.transform(countryList, 'NonExistentCountry')).toEqual([]);
  });

  it('should return an empty array if the countryList is null or undefined', () => {
    expect(pipe.transform(null, 'Country1')).toEqual([]);
    expect(pipe.transform(undefined, 'Country1')).toEqual([]);
  });
});
