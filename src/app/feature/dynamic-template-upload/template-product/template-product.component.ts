/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
// other components
import { ButtonsComponent } from 'fairfood-utils';
import {
  Observable,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import { GlobalStoreService } from 'src/app/shared/store';

@Component({
  selector: 'app-template-product',
  standalone: true,
  imports: [
    CommonModule,
    ButtonsComponent,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './template-product.component.html',
  styleUrls: ['./template-product.component.scss'],
})
export class TemplateProductComponent implements OnInit, OnDestroy {
  @Input() productControl: any;
  @Input() newProduct: boolean;

  @Output() productSelected = new EventEmitter<any>();

  pageApis: Subscription[] = [];
  productFilterOptions$: Observable<any>;
  products: any[] = [];

  constructor(private global: GlobalStoreService) {}

  ngOnInit(): void {
    this.getProductsList();
    const change2 = this.productControl.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((value: any) => {
        if (value) {
          const found = this.products.find(
            (p: any) => p.name.toLowerCase() === value.toLowerCase()
          );
          if (found) {
            this.newProduct = false;
          } else {
            this.newProduct = true;
          }
        }
      });

    this.pageApis.push(change2);
  }

  // get all available product list
  getProductsList(): void {
    const API_CALL = this.global.supplychainProducts$.subscribe({
      next: (res: any) => {
        this.products = res;
        this.productSubscription();
      },
      error: () => {
        this.products = [];
        this.productSubscription();
      },
    });
    this.pageApis.push(API_CALL);
  }

  productSubscription(): void {
    this.productFilterOptions$ = this.productControl.valueChanges.pipe(
      debounceTime(600),
      startWith(''),
      map(val => (val ? val : '')),
      switchMap((value: string) => {
        return this.productFilter(value);
      })
    );
  }

  productFilter(value: string): Observable<any[]> {
    const filterValue = value.toLowerCase();
    return this.global.supplychainProducts$.pipe(
      map((res: any) =>
        res?.filter((option: any) =>
          option.name.toLowerCase().includes(filterValue)
        )
      )
    );
  }

  selectProduct(item: any): void {
    this.productSelected.emit(item);
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
