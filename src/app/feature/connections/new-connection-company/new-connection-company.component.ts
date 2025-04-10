/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
// components
import { NewConnectionCommonComponent } from '../new-connection-common';
// services
import { NewConnectionCompanyService } from './new-connection-company.service';
// configs
import { CONNECTION_TABS, IMPORTS } from './new-connection-company.config';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-new-connection-company',
  standalone: true,
  imports: IMPORTS,
  templateUrl: './new-connection-company.component.html',
  styleUrls: ['./new-connection-company.component.scss'],
})
export class NewConnectionCompanyComponent
  extends NewConnectionCommonComponent
  implements OnInit, OnDestroy
{
  buyerReq: any = {
    limit: 10,
    offset: 0,
  };
  typeLabel: string;
  connectionType: string;

  constructor(
    private service: NewConnectionCompanyService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initData();
    this.tabGroup = JSON.parse(JSON.stringify(CONNECTION_TABS) as any);
    this.detailsForm = this.service.createBasicDetailsForm();
    this.addressForm = this.service.createAddressForm();
    this.miscForm = this.service.createMiscForm();
    this.stepOne();
    this.watchFormChanges();
    const sub = this.service.connectionInfo$.subscribe(data => {
      if (data) {
        this.incomingData = data;
      } else {
        this.incomingData = this.service.fetchDefaultData();
      }
      // initial api calls
      this.getOperations();
      this.initSubscriptions();
      this.getCountries();
    });
    this.pageApis.push(sub);
    this.initLabelAndType();
  }

  companyNameCheck(): void {
    const nameFormControl = this.detailsForm.get('name');

    const companyNameValidation = nameFormControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        filter(value => value.trim() !== '')
      )
      .subscribe((searchString: string) => {
        if (nameFormControl.valid) {
          const api = this.service
            .searchCompanyProxy(searchString, nameFormControl)
            .subscribe();
          this.pageApis.push(api);
        }
      });
    this.pageApis.push(companyNameValidation);
  }

  initSubscriptions(): void {
    this.companyNameCheck();
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
      this.miscForm.patchValue({
        connectionOf: nodeId,
        connectedTo: nodeId,
        supplyChain: schainId,
      });
      if (stockType === 'company') {
        this.detailsForm.get('name').patchValue(companyName);
        this.miscForm.get('relation').patchValue(2);
      } else {
        this.miscForm
          .get('relation')
          .patchValue(connectionType === 'buyer' ? 2 : 1);
      }
    }
    // add buyer or supplier button clicked
    if (addConnection && !fullView) {
      const { id, nodeName } = this.incomingData;
      this.miscForm.patchValue({
        relation: connectionType === 'buyer' ? 2 : 1,
        connectionOf: id,
        connectedTo: id,
        supplyChain: schainId,
      });
      this.supplySelection = [
        {
          id: nodeId,
          name: nodeName,
          selected: true,
          tier: 1,
        },
      ];
    }
  }

  // Method to set connection type drop-down
  getOperations(): void {
    const api = this.service.setOperationList().subscribe((res: any) => {
      this.operationTypes = res;
      const { stockInvite, fullView } = this.incomingData;
      if (stockInvite) {
        this.loading = false;
      } else {
        if (fullView) {
          this.getConnectionList();
        } else {
          this.loading = false;
        }
      }
    });
    this.pageApis.push(api);
  }

  getConnectionList(): void {
    /**
     * type 1 company
     * type '' company and farmer
     * type 2 farmer
     * relationship 1 supplier
     * relationship 2 buyer
     */
    const { relation } = this.miscForm.value;
    const req: any = {
      relationship: +relation === 1 ? 2 : 1,
      type: relation === 1 ? 1 : '',
      ...this.buyerReq,
    };
    const api = this.service.connectionsListing(req).subscribe({
      next: (res: any) => {
        const { count, connections } = res;
        this.supplySelection = [...this.supplySelection, ...connections];
        this.supplySelectionCount = count;

        this.loading = false;
        this.additionalLoader = false;
      },
    });
    this.pageApis.push(api);
  }

  // Method to check value & set whether it's Supplier or Buyer
  changeRelation() {
    const { relation } = this.miscForm.value;

    if (parseInt(relation) === 2) {
      this.incomingData.connectionType = 'buyer';
    } else {
      this.incomingData.connectionType = 'supplier';
    }
    this.detailsForm.patchValue({
      name: '',
      primaryOperation: '',
    });

    this.miscForm.updateValueAndValidity();
    this.supplySelection = [];
    this.getConnectionList();
    this.initLabelAndType();
  }

  buttonAction(data: string): void {
    if (data === 'next') {
      switch (this.currentStep) {
        case this.tabGroup[0].id:
          this.buttonActionStepOne();
          break;
        case this.tabGroup[1].id:
          this.buttonActionStepTwo();
          break;
        default:
          if (this.addressForm.valid && this.detailsForm.valid) {
            this.createCompanyConnection();
          }
          break;
      }
    } else {
      switch (this.currentStep) {
        case this.tabGroup[0].id:
          this.service.backButton(this.incomingData);
          break;
        case this.tabGroup[1].id:
          this.changeTab(this.tabGroup[0]);
          break;
        default:
          this.stepTwo();
          break;
      }
    }
  }

  createCompanyConnection(): void {
    this.loading = true;
    let reqObj: any;
    if (this.incomingData.stockInvite) {
      this.setLoaderText(this.translate.instant('loaderText.inviteCompany'));
    } else {
      reqObj = this.setRequestObject();
    }
    this.createConnectionApi(reqObj);
  }

  setRequestObject(): any {
    this.setLoaderText(this.translate.instant('loaderText.createConnection'));
    const reqObj = this.service.createConnectionObject(
      this.detailsForm.value,
      this.addressForm.value,
      this.miscForm.value
    );
    if (this.incomingData.addConnection) {
      const { relation } = this.miscForm.value;
      if (relation == 1) {
        if (this.selectAll) {
          reqObj.map_all_supplers = true;
        } else {
          reqObj.map_all_supplers = false;
        }
        reqObj.supplier_for = this.fetchTaggedItems();
      } else {
        if (this.selectAll) {
          reqObj.map_all_buyers = true;
        } else {
          reqObj.map_all_buyers = false;
        }
        reqObj.buyer_for = this.fetchTaggedItems();
      }
    }

    return reqObj;
  }

  createConnectionApi(reqObj: any): void {
    const api = this.service
      .inviteCompany(this.incomingData.nodeId, reqObj)
      .subscribe({
        next: () => {
          const message = this.translate.instant(
            'connections.connectionSuccess',
            {
              name: reqObj.name,
              chainName: this.incomingData.chainName,
            }
          );
          this.showSuccess(message);
          this.service.connectionInfo$.next(null);
          this.loading = false;
          if (this.incomingData.stock) {
            this.service.backToStock();
          } else {
            this.service.backToConnections();
          }
          this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
              window.location.reload();
            }
          });
        },
        error: (exception: any) => {
          this.inviteError(exception);
        },
      });
    this.pageApis.push(api);
  }

  inviteError(errors: any): void {
    this.loading = false;
    let message: string;
    if (errors.detail) {
      message = errors.detail.detail;
    } else {
      message = this.translate.instant('misc.errorSupplychain');
    }
    this.showError(message);
  }

  loadMore(): void {
    this.additionalLoader = true;
    this.buyerReq.offset += 10;
    this.getConnectionList();
  }

  initLabelAndType(): void {
    this.typeLabel =
      this.incomingData?.connectionType === 'buyer'
        ? `${this.translate.instant('company.buyer')}*`
        : `${this.translate.instant('company.supplier')}*`;
    this.connectionType =
      this.incomingData?.connectionType === 'buyer'
        ? `${this.translate.instant('company.buyerType')}*`
        : `${this.translate.instant('company.supplierType')}*`;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
