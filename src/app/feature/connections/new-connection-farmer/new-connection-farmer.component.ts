/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
// configs
import { CONNECTION_TABS, IMPORTS } from './new-connection-farmer.config';

// services
import { NewConnectionFarmerService } from './new-connection-farmer.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { UtilService } from 'src/app/shared/service';
import { NewConnectionCommonComponent } from '../new-connection-common';

@Component({
  selector: 'app-new-connection-farmer',
  standalone: true,
  imports: IMPORTS,
  templateUrl: './new-connection-farmer.component.html',
  styleUrls: ['./new-connection-farmer.component.scss'],
})
export class NewConnectionFarmerComponent
  extends NewConnectionCommonComponent
  implements OnInit, OnDestroy
{
  buyerReq: any = {
    limit: 10,
    offset: 0,
    relationship: 2,
    type: 1,
  };
  constructor(
    private service: NewConnectionFarmerService,
    globalStore: GlobalStoreService,
    utils: UtilService
  ) {
    super(utils, globalStore);
  }

  ngOnInit(): void {
    const impersonate = localStorage.getItem('impersonate');
    this.viewingAsAdmin = impersonate === 'true';
    this.tabGroup = JSON.parse(JSON.stringify(CONNECTION_TABS) as any);
    this.detailsForm = this.service.createBasicDetailsForm();
    this.addressForm = this.service.createAddressForm();
    this.miscForm = this.service.createMiscForm();
    this.stepOne();
    this.setLoaderText('Loading connection information');

    this.watchFormChanges();
    const sub = this.service.connectionInfo$.subscribe(data => {
      if (data) {
        this.incomingData = data;
      } else {
        this.incomingData = this.service.fetchNodeId();
      }
      // initial api calls
      this.patchFormData();
      this.getOperations();
      this.getCountries();
    });
    this.pageApis.push(sub);
  }

  patchFormData(): void {
    const { nodeId, schainId, farmerName, isSupplier } = this.incomingData;
    let fullName = [];
    if (farmerName) {
      fullName = farmerName.split(' ');
    }

    this.detailsForm.patchValue({
      firstName: fullName[0] ? fullName[0] : '',
      lastName: fullName[1] ? fullName[1] : '',
    });

    if (isSupplier) {
      const { connectionId } = this.incomingData;
      this.miscForm.patchValue({
        connectedTo: connectionId,
        connectionOf: connectionId,
        supplyChain: schainId,
        supplierFor: nodeId,
      });
    } else {
      this.miscForm.patchValue({
        connectedTo: nodeId,
        supplyChain: schainId,
      });
    }
  }

  // Method to set connection type drop-down
  getOperations(): void {
    const api = this.service.setOperationList().subscribe((res: any) => {
      this.operationTypes = res;
      if (this.incomingData.stock) {
        this.loading = false;
      } else {
        this.getBuyersList();
      }
    });
    this.pageApis.push(api);
  }

  getBuyersList(): void {
    if (this.incomingData.isSupplier) {
      const { nodeId, nodeName } = this.incomingData;
      this.supplySelection = [
        {
          id: nodeId,
          name: nodeName,
          selected: true,
        },
      ];
      this.supplySelectionCount = 1;
      this.loading = false;
    } else {
      this.getBuyerApi();
    }
  }

  getBuyerApi(): void {
    const api = this.service.listBuyers(this.buyerReq).subscribe((res: any) => {
      const { count, buyers } = res;
      this.supplySelection = [...this.supplySelection, ...buyers];
      this.supplySelectionCount = count;
      this.loading = false;
      this.additionalLoader = false;
    });
    this.pageApis.push(api);
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
            this.addConnection();
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

  addConnection(): void {
    this.loading = true;
    this.setLoaderText('Inviting farmer');
    const reqObj = this.service.formatRequestData(
      this.detailsForm.value,
      this.addressForm.value,
      this.miscForm.value
    );
    if (!this.incomingData.stock) {
      if (this.selectAll) {
        reqObj.map_all_buyers = true;
      } else {
        reqObj.map_all_buyers = false;
      }
      reqObj.supplier_for = this.fetchTaggedItems();
    }
    const api = this.service
      .inviteFarmer(this.incomingData.nodeId, reqObj)
      .subscribe({
        next: () => {
          const message =
            'You have successfully added ' +
            reqObj.first_name +
            ' ' +
            reqObj.last_name +
            ` to the ${this.incomingData.chainName} supply chain.`;
          this.showSuccess(message);

          if (this.incomingData.stock) {
            this.service.backToStock();
          } else {
            this.service.backToConnections();
          }
        },
        error: (err: any) => {
          console.log(err);
          this.showError(err.detail.detail);
        },
      });

    this.pageApis.push(api);
  }

  loadMoreBuyers(): void {
    this.additionalLoader = true;
    this.buyerReq.offset += 10;
    this.getBuyerApi();
  }

  ngOnDestroy(): void {
    this.additionalLoader = false;
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
