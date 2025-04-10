/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
// configs
import { CREATE_REQUEST_CONFIG } from './request-for-info.config';
// services
import { CreateRequestService } from '../create-request';
import { ListViewService } from '../../connections/list-view/list-view.service';
import { ConnectionService } from '../../connections/connections.service';
import { UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-request-for-info',
  standalone: true,
  imports: CREATE_REQUEST_CONFIG,
  templateUrl: './request-for-info.component.html',
  styleUrls: ['./request-for-info.component.scss'],
})
export class RequestForInfoComponent implements OnInit, OnDestroy {
  mapSupplierForm: FormGroup = this.fb.group({
    supplier: ['', Validators.required],
    supplyChain: ['', Validators.required],
    note: [''],
  });

  informationForm: FormGroup = this.fb.group({
    supplier: ['', Validators.required],
    claim: ['', Validators.required],
    note: [''],
  });
  supplyChainList: any[] = [];
  pageApis: Subscription[] = [];
  dataLoaded = false;
  creatingRequest = false;
  selectedInformationType = 'supplier';
  companyClaims: any;
  submitted = false;
  companies: any[] = [];
  companySelected = false;
  supplyChainSelected = false;

  constructor(
    public dialogRef: MatDialogRef<RequestForInfoComponent>,
    private fb: FormBuilder,
    private utils: UtilService,
    private service: CreateRequestService,
    private listService: ListViewService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadSupplyChain();
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Loads the supply chain data from an API and assigns it to the
   * "supplyChainList".
   */
  loadSupplyChain(): void {
    const api = this.utils.getSupplyChains().subscribe((data: any) => {
      this.supplyChainList = data.results;
      this.dataLoaded = true;
    });
    this.pageApis.push(api);
  }

  /**
   * The function updates the selected information type, clears form data, and loads company information
   */
  radioButtonChanged(event: any): void {
    this.selectedInformationType = event.value;
    this.clearFormData();
    if (this.selectedInformationType === 'info') {
      this.loadCompany();
    }
  }

  /**
   * The function returns the controls of a form.
   * @returns the controls of the mapSupplierForm.
   */
  get fcontrol() {
    return this.mapSupplierForm.controls;
  }

  /**
   * The function returns the controls of the informationForm.
   * @returns The `informationForm.controls` object is being returned.
   */
  get infocontrol() {
    return this.informationForm.controls;
  }

  /**
   * The function sets the supply chain value in a form, clears the supplier value, loads company data,
   * and sets a flag indicating that a supply chain has been selected.
   */
  setSupplyChain(data: any): void {
    const { id } = data;
    this.mapSupplierForm.patchValue({
      supplyChain: id,
      supplier: '',
    });
    this.loadCompany();
    this.supplyChainSelected = true;
  }

  /**
   * The function "onSupplierSelected" checks if the selected information type is 'info' and then calls
   * the "getCompanyClaims" function.
   */
  onSupplierSelected(data: any): void {
    if (this.selectedInformationType === 'info') {
      this.getCompanyClaims('');
    }
  }

  /**
   * The function creates a send request
   */
  createRequestMapSuppliers(): void {
    this.creatingRequest = true;
    if (this.mapSupplierForm.valid) {
      const { supplier } = this.mapSupplierForm.value;
      const selectedCompany = this.companies.find(e => e.name === supplier);
      if (selectedCompany) {
        const { supplyChain } = this.mapSupplierForm.value;
        const { note } = this.mapSupplierForm.value;
        const params = {
          node: selectedCompany?.id,
          supply_chain: supplyChain,
          note: note,
        };
        const api = this.connectionService
          .createConnectonRequest(params)
          .subscribe((res: any) => {
            if (res.success) {
              this.creatingRequest = false;
              this.dialogRef.close(res);
            }
          });
        this.pageApis.push(api);
      }
    }
  }

  /**
   * The function creates a send request
   */
  createRequestInfo(): void {
    this.creatingRequest = true;
    if (this.informationForm.valid) {
      const { supplier } = this.informationForm.value;
      const { claim } = this.informationForm.value;
      const selectedCompany = this.companies.find(e => e.name === supplier);
      const selectedClaim = this.companyClaims.find(
        (e: any) => e.name === claim
      );
      const sChainId = localStorage.getItem('supplyChainId');
      if (selectedCompany) {
        const { note } = this.informationForm.value;
        const params = {
          node: selectedCompany?.id,
          claim: selectedClaim?.id,
          note: note,
          supply_chain: sChainId,
        };
        const api = this.service
          .createClaimRequest(params)
          .subscribe((res: any) => {
            if (res.success) {
              this.creatingRequest = false;
              this.dialogRef.close(res);
            }
          });
        this.pageApis.push(api);
      }
    }
  }

  /**
   * Retrieves a list of suppliers from a service, filters the list based on
   * a search parameter, and sets error flags if the search parameter does not match any of the
   * supplier names.
   */
  loadCompany(search?: string): void {
    const { supplyChain } = this.mapSupplierForm.value;
    const api = this.service
      .getSuppliers(1, search, supplyChain)
      .subscribe((res: any) => {
        this.companies = res;
        const companyFound = this.companies.some(e => e.name === search);
        if (this.companies.length == 0 || !companyFound) {
          this.fcontrol.supplier.setErrors({ invalid: true });
          this.infocontrol.supplier.setErrors({ invalid: true });
        }
      });
    this.pageApis.push(api);
  }

  /**
   * The function clears the form data and marks the form groups as untouched.
   */
  clearFormData(): void {
    this.mapSupplierForm.patchValue({
      supplier: '',
      supplyChain: '',
      note: '',
    });
    this.informationForm.patchValue({
      supplier: '',
      claim: '',
      note: '',
    });
    this.markFormGroupUnTouched(this.mapSupplierForm);
    this.markFormGroupUnTouched(this.informationForm);
  }

  /**
   * The function recursively marks all controls in a form group and its nested form groups as
   * untouched.
   */
  markFormGroupUnTouched(formGroup: FormGroup): void {
    (<any>Object)
      .values(formGroup.controls)
      .forEach((control: FormGroup<any>) => {
        control.markAsUntouched();

        if (control.controls) {
          this.markFormGroupUnTouched(control);
        }
      });
  }

  /**
   * Retrieves company claims
   */
  getCompanyClaims(search = ''): void {
    const { supplier } = this.informationForm.value;
    const node = this.companies.find(e => e.name === supplier);
    const api = this.listService
      .getCompanyClaims('', node.id, search)
      .subscribe({
        next: (res: any) => {
          this.companyClaims = res.results;
          this.companySelected = true;
        },
        error: () => {
          this.companyClaims = [];
        },
      });
    this.pageApis.push(api);
  }

  /**
   * The ngOnDestroy function unsubscribes from all pageApis.
   */
  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
