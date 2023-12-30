/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// rxjs
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
// configs, utils
import {
  COMPONENT_IMPORTS,
  CONNECTION_TABS,
  INVITE_ONLY,
  connectionProfileDropdownValue,
} from './create-connection-popup.config';
import { ICommonObj, ITabItem } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { successFormatter } from 'src/app/shared/configs/app.methods';
import { ButtonState } from 'fairfood-utils';
// services
import { GlobalStoreService } from 'src/app/shared/store';
import { ConnectionService } from '../connections.service';
import { CreateConnectionPopupService } from './create-connection-popup.service';

/**
 * Component for creating a connection popup.
 */
@Component({
  selector: 'app-create-connection-popup',
  templateUrl: './create-connection-popup.component.html',
  styleUrls: ['./create-connection-popup.component.scss'],
  standalone: true,
  imports: [...COMPONENT_IMPORTS],
})
export class CreateConnectionPopupComponent implements OnInit, OnDestroy {
  connectionTabs: ITabItem[];
  currentStep: string;
  operationTypes: any[];

  // declare Form group company form
  companyForm: FormGroup;
  nextButtonState: ButtonState;
  prevButton = 'Cancel';
  dataLoaded: boolean;
  pageApis: Subscription[] = [];
  countryList: any[];
  stateList: any[];
  countryCodeList: ICommonObj[];
  loaderText: string;
  companyNames: any;
  supplySelection: any[] = [];

  /**
   * Constructor of the component.
   * @param dialogRef - Reference to the dialog.
   * @param incomingData - Data passed to the dialog.
   * @param connectionService - Service for handling connection-related operations.
   * @param globalStore - Service for accessing global store data.
   * @param service - Service for handling create connection popup operations.
   */
  constructor(
    public dialogRef: MatDialogRef<CreateConnectionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public incomingData: any,
    private connectionService: ConnectionService,
    private globalStore: GlobalStoreService,
    private service: CreateConnectionPopupService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit(): void {
    if (this.incomingData.stock) {
      this.initDataForStock();
    } else {
      this.initData();
    }
  }

  /**
   * Initializes data for creating a connection.
   */
  initData(): void {
    this.connectionTabs = [...CONNECTION_TABS];
    this.currentStep = CONNECTION_TABS[0].id;
    this.companyForm = this.service.createCompanyForm();
    this.initSubscriptions();
    this.nextButtonState = this.service.initialButtonState(false);
    this.loaderText = 'Loading data';
    this.getOperations();
  }

  /**
   * Initializes data for creating a connection with stock information.
   */
  initDataForStock(): void {
    // send stock invitation only
    if (this.incomingData.stockInvite) {
      this.connectionTabs = [...INVITE_ONLY];
      this.connectionTabs[0].active = true;
      this.currentStep = INVITE_ONLY[0].id;
      this.companyForm = this.service.createInviteForm();
      this.companyForm.patchValue({
        relation: 2,
        connectedTo: this.incomingData.nodeId,
        supplyChain: this.incomingData.schainId,
        company: this.incomingData.id,
      });
      this.initInviteOnlySub();
    } else {
      this.connectionTabs = [...CONNECTION_TABS];
      this.currentStep = CONNECTION_TABS[0].id;
      this.companyForm = this.service.createCompanyForm();
      this.initSubscriptions();
    }

    this.nextButtonState = this.service.initialButtonState(
      this.incomingData.stockInvite
    );

    this.loaderText = 'Loading data';
    this.getOperations();
  }

  /**
   * Initializes subscriptions for the invite-only scenario.
   */
  initInviteOnlySub(): void {
    const formBasic = this.companyForm.statusChanges.subscribe(st => {
      if (st === 'VALID') {
        this.nextButtonState.disabled = false;
      } else {
        this.nextButtonState.disabled = true;
      }
    });
    this.pageApis.push(formBasic);
  }

  basicFormSub(): void {
    const formBasic = this.companyForm
      .get('basic')
      .statusChanges.subscribe(st => {
        if (this.currentStep === 'basic') {
          if (st === 'VALID') {
            this.nextButtonState.disabled = false;
          } else {
            this.nextButtonState.disabled = true;
          }
        }
      });
    const formAddress = this.companyForm
      .get('addressDetails')
      .statusChanges.subscribe(st => {
        if (this.currentStep === 'address') {
          if (st === 'VALID') {
            this.nextButtonState.disabled = false;
          } else {
            this.nextButtonState.disabled = true;
          }
        }
      });
    this.pageApis.push(formAddress);
    this.pageApis.push(formBasic);
  }

  companyNameValidationSub(): void {
    const buyerNameFormControl = this.companyForm.get('basic.name');

    const companyNameValidation = buyerNameFormControl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(res => {
        const api = this.connectionService
          .searchCompany(res)
          .pipe(
            tap(responseObj => {
              const companyNames = responseObj.data.results;
              if (companyNames?.length === 1) {
                if (
                  companyNames[0].name.toLowerCase() ===
                  buyerNameFormControl.value.toLowerCase()
                ) {
                  this.companyForm.get('basic.name').setErrors({
                    connected: true,
                  });
                } else {
                  this.companyForm.get('basic.name').setErrors(null);
                }
              } else {
                this.companyForm.get('basic.name').setErrors(null);
              }
            })
          )
          .subscribe();
        this.pageApis.push(api);
      });
    this.pageApis.push(companyNameValidation);
  }

  initSubscriptions(): void {
    this.basicFormSub();
    this.companyNameValidationSub();
    const {
      nodeId,
      schainId,
      stockType,
      addConnection,
      companyName,
      fullView,
      connectionType,
    } = this.incomingData;
    if (stockType === 'company' || fullView) {
      this.companyForm.patchValue({
        connectionOf: nodeId,
        connectedTo: nodeId,
        supplyChain: schainId,
      });
      if (stockType === 'company') {
        this.companyForm.get('basic.name').patchValue(companyName);
        this.companyForm.get('relation').patchValue(2);
      } else {
        this.companyForm
          .get('relation')
          .patchValue(connectionType === 'buyer' ? 2 : 1);
      }
    }
    // add buyer or supplier button clicked
    if (addConnection && !fullView) {
      const { id, nodeName } = this.incomingData;
      this.companyForm.patchValue({
        relation: connectionType === 'buyer' ? 2 : 1,
        connectionOf: id,
        connectedTo: id,
        supplyChain: schainId,
      });
      this.supplySelection = [
        {
          id: nodeId,
          name: nodeName,
        },
      ];
    }
  }

  getBuyers(): void {
    const api = this.connectionService
      .getBuyers(this.incomingData.schain_id)
      .subscribe(res => {
        this.supplySelection = res.results;
      });
    this.pageApis.push(api);
  }

  // Method to set connection type drop-down
  getOperations(): void {
    const api = this.connectionService
      .listOperations()
      .subscribe((res: any) => {
        // it only handles the company connection creation
        this.operationTypes = res.results.filter((e: any) => {
          return e.node_type === 1;
        });
        // if stock invite only is true then no need for country data
        if (!this.incomingData.stockInvite) {
          this.getCountries();
        } else {
          this.dataLoaded = true;
        }
      });
    this.pageApis.push(api);
  }

  // Get all countries from API / local cache
  getCountries(): void {
    const sub2 = this.globalStore.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
          this.dataLoaded = true;
        }
      },
    });
    const sub3 = this.globalStore.countryCodeList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryCodeList = res;
        }
      },
    });
    this.pageApis.push(sub3);
    this.pageApis.push(sub2);
  }

  setStateList(selectedSub: any): void {
    this.stateList = Object.keys(selectedSub).map(key => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });
  }

  changeHistoryTab(tabItem: ITabItem) {
    if (this.currentStep === 'basic') {
      if (tabItem.id === 'address') {
        this.prevButton = 'Back';
      } else if (tabItem.id === 'invite') {
        this.prevButton = 'Back';
        this.nextButtonState.buttonText = 'Invite connection';
      }
    } else if (this.currentStep === 'address') {
      if (tabItem.id === 'basic') {
        this.prevButton = 'Cancel';
        this.nextButtonState.disabled = false;
      } else if (tabItem.id === 'invite') {
        this.nextButtonState.disabled = false;
        this.nextButtonState.buttonText = 'Invite connection';
      }
    } else {
      if (tabItem.id === 'basic') {
        this.prevButton = 'Cancel';
        this.nextButtonState.buttonText = 'Continue';
      } else if (tabItem.id === 'address') {
        this.nextButtonState.buttonText = 'Continue';
      }
    }
    this.currentStep = tabItem.id;
  }

  dropdownChanged(data: any, formControlName: string, groupName: string): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    // when clear filter is clicked dropdown component emits the value:- { id: 'All' }
    // it provide the option to clear the dropdown value
    connectionProfileDropdownValue(
      selectedValue,
      formControlName,
      this.companyForm.get(groupName),
      data
    );

    if (formControlName === 'country') {
      if (selectedValue) {
        const index = this.countryList.findIndex(m => m.id === selectedValue);
        const countryCode = this.countryCodeList.find((a: any) =>
          a.name.includes(selectedValue)
        );
        const selectedSub = this.countryList[index].sub_divisions;
        this.companyForm.get(groupName).patchValue({
          inDialCode: countryCode?.id || '',
        });
        this.setStateList(selectedSub);
      } else {
        this.stateList = [];
      }
    }
    setTimeout(() => {
      this.companyForm.get(groupName).updateValueAndValidity();
    }, 200);
  }

  nextClicked(data: any): void {
    switch (data) {
      case 'next':
        switch (this.currentStep) {
          case 'basic':
            this.connectionTabs = this.connectionTabs.map((p: ITabItem) =>
              p.id === 'address' ? { ...p, active: true } : p
            );
            this.nextButtonState.disabled = true;
            this.prevButton = 'Back';
            this.currentStep = 'address';
            break;
          case 'address':
            this.connectionTabs = this.connectionTabs.map((p: ITabItem) =>
              p.id === 'invite' ? { ...p, active: true } : p
            );
            this.nextButtonState.disabled = false;
            this.nextButtonState.buttonText = 'Invite connection';
            this.currentStep = 'invite';
            break;
          case 'invite':
            this.createCompanyConnection();
            break;
        }
        break;
      default:
        switch (this.currentStep) {
          case 'basic':
            this.close();
            break;
          case 'address':
            this.prevButton = 'Cancel';
            this.currentStep = 'basic';
            break;
          case 'invite':
            this.nextButtonState.buttonText = 'Continue';
            this.currentStep = 'address';
            break;
        }
        break;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  createCompanyConnection(): void {
    this.dataLoaded = false;
    let reqObj: any;
    if (this.incomingData.stockInvite) {
      this.loaderText = 'Inviting connection';
      reqObj = this.service.createInviteObject(this.companyForm);
    } else {
      this.loaderText = 'Creating connection';
      reqObj = this.service.createConnectionObject(this.companyForm);
      if (this.incomingData.addConnection) {
        const { relation } = this.companyForm.value;
        if (relation == 1) {
          reqObj.supplier_for = this.supplySelection?.map((e: any) => e.id);
        } else {
          reqObj.buyer_for = this.supplySelection?.map((e: any) => e.id);
        }
      }
    }
    this.createConnectionApi(reqObj);
  }

  createConnectionApi(reqObj: any): void {
    const api = this.service
      .inviteCompany(this.incomingData.nodeId, reqObj)
      .subscribe({
        next: (result: any) => {
          const { success, data, detail } = result;
          if (success) {
            this.incomingData.params = reqObj;
            this.incomingData.responseData = data;
            this.incomingData.message = ACTION_TYPE.SUCCESS;
            this.incomingData.messageBody =
              'Added ' +
              reqObj.name +
              ` to the ${this.incomingData.chainName} supply chain.`;
            this.dialogRef.close(this.incomingData);
          } else {
            this.incomingData.message = ACTION_TYPE.FAILED;
            this.incomingData.messageBody = detail.detail;
            this.dialogRef.close(this.incomingData);
          }
          this.dataLoaded = true;
        },
        error: (exception: any) => {
          this.inviteError(exception.error, reqObj);
        },
      });
    this.pageApis.push(api);
  }

  inviteError(errors: any, reqObj: any): void {
    this.dataLoaded = true;
    this.incomingData.params = reqObj;
    this.incomingData._message = ACTION_TYPE.FAILED;
    if (errors.detail) {
      this.incomingData.messageBody = errors.detail.detail;
    } else {
      this.incomingData.messageBody = 'Error adding supply chain';
    }
    this.dialogRef.close(this.incomingData);
  }

  dropdownChangedInvite(data: any): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    connectionProfileDropdownValue(
      selectedValue,
      'primaryOperation',
      this.companyForm,
      data
    );
  }

  // Method to check value & set whether it's Supplier or Buyer
  changeRelation() {
    const val = +this.companyForm.controls.relation.value;
    if (val === 2) {
      this.incomingData.connectionType = 'buyer';
      // this.setSupplyFor('buyer');
    } else {
      // this.setSupplyFor('supplier');
      this.incomingData.connectionType = 'supplier';
    }
    this.companyForm.get('basic').patchValue({
      name: '',
      primaryOperation: '',
    });
    this.companyForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
