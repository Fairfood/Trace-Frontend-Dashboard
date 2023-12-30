import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveInStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving data in storage:', error);
      // Handle the error appropriately, e.g., show a notification to the user
    }
  }

  retrieveStoredData(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data from storage:', error);
      // Handle the error appropriately, e.g., show a notification to the user
      return null;
    }
  }

  clearStorage(): void {
    localStorage.clear();
  }
}
