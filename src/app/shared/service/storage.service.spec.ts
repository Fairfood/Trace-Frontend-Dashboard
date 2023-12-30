import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    });

    storageService = TestBed.inject(StorageService);

    // Clear local storage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(storageService).toBeTruthy();
  });

  it('should save data in storage', () => {
    const key = 'testKey';
    const value = 'testValue';

    storageService.saveInStorage(key, value);

    const retrievedValue = localStorage.getItem(key);
    expect(retrievedValue).toBe(value);
  });

  it('should handle errors when saving data', () => {
    // Mock a scenario where saving data throws an error
    spyOn(localStorage, 'setItem').and.throwError('Storage error');

    const key = 'testKey';
    const value = 'testValue';

    // Ensure that the function doesn't throw an error
    expect(() => storageService.saveInStorage(key, value)).not.toThrowError();
  });

  it('should retrieve stored data', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorage.setItem(key, value);

    const retrievedValue = storageService.retrieveStoredData(key);
    expect(retrievedValue).toBe(value);
  });

  it('should handle errors when retrieving data', () => {
    // Mock a scenario where retrieving data throws an error
    spyOn(localStorage, 'getItem').and.throwError('Storage error');

    const key = 'testKey';

    const retrievedValue = storageService.retrieveStoredData(key);
    expect(retrievedValue).toBeNull();
  });

  it('should clear storage', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorage.setItem(key, value);

    storageService.clearStorage();

    expect(localStorage.getItem(key)).toBeNull();
  });
});
