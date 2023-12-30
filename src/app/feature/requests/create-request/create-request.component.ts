/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

// rxjs
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
// configs
import {
  ACTION_TYPE,
  UNITS,
  quantityRegex,
} from 'src/app/shared/configs/app.constants';
import { CREATE_REQUEST_CONFIG } from './create-request.config';
// services
import { ClaimService } from '../../claim';
import { GlobalStoreService } from 'src/app/shared/store';
import { CreateRequestService } from './create-request.service';
import { UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: CREATE_REQUEST_CONFIG,
  templateUrl: './create-request.component.html',
  styleUrls: ['./create-request.component.scss'],
})
export class CreateRequestComponent implements OnInit, OnDestroy {
  pageApis: Subscription[] = [];
  claims: any = [];
  requestForm: FormGroup = this.fb.group({
    supplier: ['', Validators.required],
    product: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    quantity: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(11),
        Validators.pattern(quantityRegex),
      ],
    ],
    unit: ['1'],
    currency: [''],
    price: ['', [Validators.minLength(1), Validators.pattern(quantityRegex)]],
    note: [''],
  });

  products: any[] = [];
  units: any[] = UNITS;
  currencies: any;
  product: any;
  companies: any[] = [];
  filteredOptionsSupplier$: Observable<any[]>;
  filteredOptionsProducts$: Observable<any[]>;
  submitted = false;
  dataLoaded = false;
  supplierInvalid = false;
  creatingRequest = false;
  silentInvite = false;

  constructor(
    public dialogRef: MatDialogRef<CreateRequestComponent>,
    private fb: FormBuilder,
    private claimService: ClaimService,
    private global: GlobalStoreService,
    private service: CreateRequestService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();

    const sub = this.global.glboalConstants$.subscribe(res => {
      this.currencies = res.currencies;
    });

    this.pageApis.push(sub);
  }

  initSubscription(): void {
    this.filteredOptionsSupplier$ = this.fcontrol.supplier.valueChanges.pipe(
      startWith(''),
      map(value => {
        const result = this._filterValues(value, this.companies);
        if (result.length === 0) {
          this.supplierInvalid = true;
          this.fcontrol.supplier.setErrors({ invalid: true });
        }
        return result;
      })
    );

    this.filteredOptionsProducts$ = this.fcontrol.product.valueChanges.pipe(
      startWith(''),
      map(value => this._filterValues(value, this.products))
    );
  }

  private _filterValues(value: string, optionArray: any[]): any[] {
    const filterValue = value.toLowerCase();

    return optionArray.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  /**
   * get suppliers in the chain to request the stock
   * @param search string
   */
  loadSuppliers(search?: string): void {
    const API_CALL = this.service.getSuppliers(1, search).subscribe({
      next: (res: any) => {
        this.companies = res;
        if (this.companies.length === 0) {
          this.supplierInvalid = true;
          this.fcontrol.supplier.setErrors({ invalid: true });
        }
        this.loadProducts();
      },
      error: () => this.loadProducts(),
    });
    this.pageApis.push(API_CALL);
  }

  // Get all available products
  loadProducts(): void {
    const sub2 = this.global.supplychainProducts$.subscribe(products => {
      this.products = products;
      this.getClaims();
    });

    this.pageApis.push(sub2);
  }

  /**
   * Available claim list
   */
  getClaims(): void {
    const API_CALL = this.claimService.getClaims().subscribe(res => {
      res.map((claim: any) => {
        const { id, name } = claim;
        this.claims.push({ id, name, selected: false });
      });
      this.dataLoaded = true;
      this.initSubscription();
    });
    this.pageApis.push(API_CALL);
  }

  /**
   * Form related actions
   */

  get fcontrol() {
    return this.requestForm.controls;
  }

  /**
   * Supplier verification
   */
  checkSupplier(): void {
    this.silentInvite = false;
    if (!this.supplierInvalid && this.companies.length === 1) {
      this.checkSilentMapping(this.fcontrol.supplier.value);
    }
  }

  checkSilentMapping(val: string): void {
    this.companies.forEach(e => {
      if (e.name.toLowerCase() === val.toLowerCase()) {
        this.silentInvite = !e.email_sent;
      }
    });
  }

  onSupplierSelected(event: any): void {
    this.silentInvite = false;
    this.checkSilentMapping(event.option.value);
  }

  /**
   * Validation for entered price value
   */
  checkPrice(): void {
    const currencyControl = this.fcontrol.currency;
    if (+this.fcontrol.price.value > 0) {
      if (this.fcontrol.currency.value === '') {
        currencyControl.setValidators([Validators.required]);
        currencyControl.setErrors({ incorrect: true });
      } else {
        currencyControl.setValidators(null);
        currencyControl.setErrors(null);
      }
    } else {
      currencyControl.setValidators(null);
      currencyControl.setErrors(null);
      currencyControl.setValue('');
    }
  }

  selectClaim(index: number): void {
    this.claims[index].selected = !this.claims[index].selected;
  }

  /**
   * When form submits
   */
  createRequest(): void {
    const { supplier, unit, product, currency, price, note, quantity } =
      this.requestForm.value;
    this.submitted = true;
    const company = this.companies.find(a => a.name === supplier);
    const selectedClaims: any = [];
    this.claims.filter((e: any) => {
      if (e.selected) {
        selectedClaims.push(e.id);
      }
    });
    const selectedProduct = this.products.find(a => a.name === product);
    const reqObj: any = {
      supplier: company.id,
      product: selectedProduct.id,
      unit,
      claims: [...selectedClaims],
      note,
      quantity,
    };
    if (price && currency) {
      reqObj.price = price;
      reqObj.currency = currency;
    }
    this.createTransparencyRequest(reqObj);
  }

  /**
   * Request for a stock api call
   * @param params any
   */
  createTransparencyRequest(params: any): void {
    this.creatingRequest = false;
    if (this.requestForm.valid) {
      this.creatingRequest = true;
      const API_CALL = this.service.createStockRequest(params).subscribe({
        next: (res: any) => {
          this.creatingRequest = false;
          this.dialogRef.close(res);
        },
        error: () => {
          this.util.customSnackBar('Invalid Form values', ACTION_TYPE.FAILED);
          this.creatingRequest = false;
        },
      });
      this.pageApis.push(API_CALL);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  setCurrency(data: any): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    this.requestForm.patchValue({
      currency: selectedValue,
    });
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
