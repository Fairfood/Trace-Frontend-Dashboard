/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseStoreService } from './base-store.service';

class TestableBaseStoreService<T> extends BaseStoreService<T> {
  selectForTesting<K>(mapFn: (state: T) => K) {
    return this.select(mapFn);
  }

  setStateForTesting(newState: Partial<T>) {
    this.setState(newState);
  }
}

describe('BaseStoreService', () => {
  let service: TestableBaseStoreService<any>;
  const initialState = { prop1: 'initial', prop2: 42 };

  beforeEach(() => {
    service = new TestableBaseStoreService(initialState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the state with the provided initial state', () => {
    service
      .selectForTesting(state => state)
      .subscribe(state => {
        expect(state).toEqual(initialState);
      });
  });

  it('should select and return an observable with the distinctUntilChanged operator', () => {
    const emittedValues: string[] = [];
    service
      .selectForTesting(state => state.prop1)
      .subscribe(selectedValue => {
        emittedValues.push(selectedValue);
      });

    // This will emit because the state has changed
    service.setStateForTesting({ prop1: 'modified' });

    // This should not emit, as the state has not changed
    service.setStateForTesting({ prop1: 'modified' });

    // This will emit because the state has changed
    service.setStateForTesting({ prop1: 'another modification' });

    // Check the emitted values
    expect(emittedValues).toEqual([
      'initial',
      'modified',
      'another modification',
    ]);
  });

  it('should set the state with the provided newState', () => {
    const sub = service
      .selectForTesting(state => state)
      .subscribe(state => {
        expect(state).toEqual(initialState);
      });

    sub.unsubscribe();

    const newState = { prop1: 'modified', prop2: 100 }; // Corrected newState
    service.setStateForTesting(newState);

    const newSub = service
      .selectForTesting(state => state)
      .subscribe(state => {
        expect(state.prop1).toEqual('modified'); // Corrected expectation
        expect(state.prop2).toEqual(100); // Corrected expectation
      });

    newSub.unsubscribe();
  });
});
