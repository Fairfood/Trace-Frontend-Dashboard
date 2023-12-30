/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CREATE_REQUEST_CONFIG } from './request-for-info.config';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { UtilService } from 'src/app/shared/service';
import { Observable, Subscription, startWith, switchMap } from 'rxjs';
import { CreateRequestService } from '../create-request';

@Component({
  selector: 'app-request-for-info',
  standalone: true,
  imports: CREATE_REQUEST_CONFIG,
  templateUrl: './request-for-info.component.html',
  styleUrls: ['./request-for-info.component.scss'],
})
export class RequestForInfoComponent implements OnInit, OnDestroy {
  selectingOptions: string;
  mapSupplierForm = this.fb.group({
    supplier: ['', Validators.required],
    supplyChain: ['', Validators.required],
    note: [''],
  });

  informationForm = this.fb.group({
    supplier: ['', Validators.required],
    claim: ['', Validators.required],
    note: [''],
  });
  supplyChainList: any[] = [];
  pageApis: Subscription[] = [];
  loading = true;
  filteredOptionsSupplier$: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<RequestForInfoComponent>,
    private fb: FormBuilder,
    private utils: UtilService,
    private service: CreateRequestService
  ) {}

  ngOnInit(): void {
    this.loadSupplyChain();
    this.filteredOptionsSupplier$ = this.fcontrol.supplier.valueChanges.pipe(
      startWith(''),
      switchMap((value: string) => {
        return this.service.getSuppliers(1, value);
      })
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  loadSupplyChain(): void {
    const api = this.utils.getSupplyChains().subscribe((data: any) => {
      this.supplyChainList = data.results;
      this.loading = false;
    });
    this.pageApis.push(api);
  }

  radioButtonChanged(event: any): void {
    this.selectingOptions = event.value;
  }

  get fcontrol() {
    return this.mapSupplierForm.controls;
  }

  setSupplyChain(data: any): void {
    const { id } = data;
    this.mapSupplierForm.patchValue({
      supplyChain: id,
    });
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
