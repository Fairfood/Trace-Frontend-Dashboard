import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

/**
 * Base class for creating a store service with state management.
 * @template T - Generic type representing the state structure.
 */
export class BaseStoreService<T> {
  private state$: BehaviorSubject<T>;

  /**
   * Getter for accessing the current state.
   */
  protected get state(): T {
    return this.state$.getValue();
  }

  /**
   * Initializes the BaseStoreService with an initial state.
   * @param initialState - The initial state of the store.
   */
  constructor(initialState: T) {
    this.state$ = new BehaviorSubject<T>(initialState);
  }

  /**
   * Selects a portion of the state using a mapping function and returns an observable.
   * @template K - Generic type representing the selected portion of the state.
   * @param mapFn - Mapping function to select a portion of the state.
   * @returns An observable representing the selected state.
   */
  protected select<K>(mapFn: (state: T) => K): Observable<K> {
    return this.state$.asObservable().pipe(
      map((state: T) => mapFn(state)),
      distinctUntilChanged()
    );
  }

  /**
   * Updates the state by merging the current state with the provided partial state.
   * @param newState - Partial state object containing the changes to be applied.
   */
  protected setState(newState: Partial<T>) {
    this.state$.next({
      ...this.state,
      ...newState,
    });
  }
}
