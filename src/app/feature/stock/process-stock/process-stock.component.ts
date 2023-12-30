/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
// config
import {
  StepValues,
  TransactionState,
  stockProcessTabs,
} from './process-stock.config';
import { ITabItem } from 'src/app/shared/configs/app.model';
// services
import { StockService } from '../stock.service';
import { StockProcessService } from './stock-process.service';
import { UtilService } from 'src/app/shared/service';
import { ClaimService } from '../../claim';
// store
import { ListingStoreService } from '../listing';
import { GlobalStoreService } from 'src/app/shared/store';
// constants and configs
import { CLAIM_INHERITANCE_TYPES } from '../../claim/claim.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

let STOCK_PROCESS: ITabItem[];

/**
 * Process stock component should handle internal and external transactions
 * Send stock, merge stock and convert stock
 */
@Component({
  selector: 'app-process-stock',
  templateUrl: './process-stock.component.html',
  styleUrls: ['./process-stock.component.scss'],
})
export class ProcessStockComponent implements OnInit, OnDestroy {
  pageApis: Subscription[] = [];
  readonly StepValues = StepValues;
  stockTabs: ITabItem[];
  currentStep: string;
  batch: any[] = [];
  transactionFormData: any;
  requestedDetails: any;
  claimsList: any;
  companies: any[];
  loaderText: string;
  loading = true;

  listOfClaims: any[];

  buttonNextState: any;
  transactionId: any;
  selectedClaims: any[];
  actionUrl: string;
  // only for merge stock
  inheritedClaims: any[];

  constructor(
    private processService: StockProcessService,
    private claimService: ClaimService,
    private stockService: StockService,
    private router: Router,
    private util: UtilService,
    private listingStore: ListingStoreService,
    private store: GlobalStoreService
  ) {
    this.initTabs();
  }

  ngOnInit(): void {
    this.initStep();
    this.initSubscriptions();

    if (this.actionUrl !== '/stock/process-merge') {
      this.loaderText = 'Loading company data';
      this.getConnectedCompanyList();
    } else {
      this.loading = false;
    }
  }

  /**
   * Initialize tabs based on the action url
   */
  initTabs(): void {
    this.actionUrl = this.router.url;
    switch (this.actionUrl) {
      case '/stock/stock-send':
        STOCK_PROCESS = stockProcessTabs('send');
        this.stockTabs = STOCK_PROCESS;
        break;
      case '/stock/process-convert':
        STOCK_PROCESS = stockProcessTabs('convert');
        this.stockTabs = STOCK_PROCESS;
        break;
      case '/stock/process-merge':
        STOCK_PROCESS = stockProcessTabs('merge');
        this.stockTabs = STOCK_PROCESS;
        break;
      default:
        STOCK_PROCESS = stockProcessTabs('receive');
        this.stockTabs = STOCK_PROCESS;
        break;
    }
  }

  /**
   * Initialize the step
   */
  initStep(): void {
    const listingInfo = this.processService.getListingInfo();
    if (listingInfo) {
      this.batch = listingInfo.batches;
    }
    this.currentStep = StepValues.TRANSACTION;
    this.buttonNextState = {
      action: 'init',
      disabled: true,
      currentStep: this.currentStep,
      buttonText: 'Continue',
    };
  }

  /**
   * Initialize subscriptions
   */
  initSubscriptions(): void {
    const supplyChainIdSub = this.util.supplyChainData$.subscribe(
      (res: any) => {
        if (res && res !== this.stockService.supplyChainData()) {
          this.supplyChainChangeAction();
        }
      }
    );

    const dataSub = this.processService
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          const { transactionDetails, requestedData } = result;
          if (transactionDetails) {
            this.transactionFormData = transactionDetails;
          }

          if (requestedData) {
            this.requestedDetails = requestedData;
          }
        }
      });

    const claimSub = this.processService
      .currentClaimState()
      .subscribe(result => {
        if (result) {
          this.selectedClaims = [];
          const { claimsList } = result;
          this.listOfClaims = JSON.parse(JSON.stringify(claimsList));
          claimsList.map((c: any) => {
            if (c.selected) {
              this.selectedClaims.push(c);
            }
          });
        }
      });
    this.pageApis.push(claimSub);
    this.pageApis.push(dataSub);
    this.pageApis.push(supplyChainIdSub);
  }

  /**
   * Supply chain changed action
   */
  supplyChainChangeAction(): void {
    this.util.customSnackBar(
      'Supply chain changed! Please try again from the stocks!',
      ACTION_TYPE.SUCCESS
    );
    this.processService.updateSummaryData(null);
    this.processService.updateListingInfo(null);
    this.processService.navigateToStockListing();
  }

  /**
   * Change history tab
   * @param data ITabItem
   */
  changeHistoryTab(data: ITabItem): void {
    if (data.id === StepValues.STOCK) {
      this.processService.navigateToStockListing();
    } else {
      this.currentStep = data.id;
    }
    const summary = this.processService.getSummaryData();
    this.processService.updateSummaryData({
      ...summary,
      currentStep: this.currentStep,
    });
  }

  /**
   * Change step goto claims
   * @param data boolean
   */
  goToClaims(data: boolean): void {
    const claimTab = this.stockTabs.find(s => s.id === StepValues.CLAIMS);
    if (claimTab.active === true) {
      this.changeHistoryTab(claimTab);
    } else {
      if (this.actionUrl === '/stock/receive') {
        this.processClaims(this.claimsList);
      } else {
        this.getInheritableClaims();
      }
    }
  }

  /**
   * Merge stock navigation
   * @param data boolean
   */
  mergeStockNavigation(data: boolean): void {
    const summaryTab = this.stockTabs.find(s => s.id === StepValues.SUMMARY);
    if (summaryTab.active === true) {
      this.changeHistoryTab(summaryTab);
    } else {
      // when merging a stock all the inheritable claims should be attached to the transaction
      this.getInheritableClaims();
    }
  }

  disableClaimTab(action: string): void {
    if (action === 'disable') {
      const foundIndex = STOCK_PROCESS.findIndex(
        s => s.id === StepValues.CLAIMS
      );
      if (this.stockTabs[foundIndex].active) {
        this.stockTabs = this.stockTabs.map((p: ITabItem) =>
          p.id === StepValues.CLAIMS ? { ...p, active: false } : p
        );
      }
    }
  }

  fromSummary(type: string): void {
    if (type === 'next') {
      if (this.actionUrl === '/stock/stock-send') {
        this.createExternalTransaction();
      } else if (this.actionUrl === '/stock/process-convert') {
        this.convertStockTransaction();
      } else if (this.actionUrl === '/stock/process-merge') {
        this.mergeStockTransaction();
      } else {
        this.receiveSingleStock();
      }
    } else {
      if (this.actionUrl === '/stock/process-merge') {
        const foundIndex = STOCK_PROCESS.findIndex(
          s => s.id === StepValues.TRANSACTION
        );
        this.changeHistoryTab(this.stockTabs[foundIndex]);
      } else {
        const foundIndex = STOCK_PROCESS.findIndex(
          s => s.id === StepValues.CLAIMS
        );
        this.changeHistoryTab(this.stockTabs[foundIndex]);
      }
    }
  }

  fromClaims(type: string): void {
    if (type === 'next') {
      const foundIndex = STOCK_PROCESS.findIndex(
        s => s.id === StepValues.SUMMARY
      );
      this.stockTabs = this.stockTabs.map((p: ITabItem) =>
        p.id === StepValues.SUMMARY ? { ...p, active: true } : p
      );
      this.changeHistoryTab(this.stockTabs[foundIndex]);
    } else {
      const foundIndex = STOCK_PROCESS.findIndex(
        s => s.id === StepValues.TRANSACTION
      );
      this.changeHistoryTab(this.stockTabs[foundIndex]);
    }
  }

  updateSummaryData(): void {
    const summary = this.processService.getSummaryData();
    this.processService.updateSummaryData({
      ...summary,
      currentStep: this.currentStep,
    });
  }

  /**
   * Get all the connected suppliers for initial showing
   */
  getConnectedCompanyList(): void {
    const API_CALL = this.store.connectedCompanies$.subscribe({
      next: (res: any) => {
        if (res) {
          this.companies = res;
          this.loaderText = 'Loading claims';
          this.getAllClaims();
        }
      },
      error: err => {
        console.log(err);
        this.companies = [];
        this.getAllClaims();
      },
    });
    this.pageApis.push(API_CALL);
  }

  // get available claims
  getAllClaims(): void {
    const sub = this.listingStore.claimMasterData$.subscribe({
      next: res => {
        this.claimsList = res;
        this.loading = false;
      },
      error: () => {
        this.claimsList = [];
        this.loading = false;
      },
    });
    this.pageApis.push(sub);
  }

  /**
   * Check if inheritable claims are there
   */
  getInheritableClaims(): void {
    if (this.batch.length > 0) {
      let outputProd: any[];
      if (this.actionUrl === '/stock/process-convert') {
        const { items } = this.transactionFormData;
        outputProd = items?.map((p: any) => p.product);
      } else {
        outputProd = [this.transactionFormData.product];
      }
      const params = {
        batches: this.batch,
        output_products: outputProd,
      };
      const api = this.claimService
        .getInheritableClaims(params)
        .subscribe((res: any) => {
          // newly added case
          if (this.actionUrl === '/stock/process-merge') {
            this.inheritedClaims = [];
            res.map((e: any) => {
              // only used in merge stock transaction
              this.inheritedClaims.push({
                claim: e.claim,
                verifier: null,
                inherited: true,
              });
            });
            const foundIndex = STOCK_PROCESS.findIndex(
              s => s.id === StepValues.SUMMARY
            );
            this.stockTabs = this.stockTabs.map((p: ITabItem) =>
              p.id === StepValues.SUMMARY ? { ...p, active: true } : p
            );
            this.changeHistoryTab(this.stockTabs[foundIndex]);
          } else {
            this.setInheritableClaims(res);
          }
        });
      this.pageApis.push(api);
    }
  }

  setInheritableClaims(inheritableClaims: any): void {
    if (inheritableClaims.length) {
      this.claimsList.map((e: any) => {
        inheritableClaims.map((f: any) => {
          if (e.id === f.claim) {
            e.inherited = true;
            e.selected = true;
            e.disabled = f.removable ? false : true;
            e.verification_percentage = f.verification_percentage;
            e.criteria.map((criteria: any) => {
              criteria.evidence = f.criteria;
            });
          }
        });
      });
    } else {
      this.claimsList.map((e: any) => {
        if (
          e.inheritable === CLAIM_INHERITANCE_TYPES.INHERITANCE_TYPE_PRODUCT &&
          e.removable
        ) {
          e.inherited = false;
          e.selected = false;
        }
      });
    }

    this.processClaims(this.claimsList);
  }

  // get available claims
  processClaims(allList: any[]): void {
    this.listOfClaims = this.claimService.formatClaimsData(
      allList,
      this.companies
    );
    this.processService.updateClaimState('claimsList', this.listOfClaims);
    const foundIndex = STOCK_PROCESS.findIndex(s => s.id === StepValues.CLAIMS);
    this.stockTabs = this.stockTabs.map((p: ITabItem) =>
      p.id === StepValues.CLAIMS ? { ...p, active: true } : p
    );
    this.changeHistoryTab(this.stockTabs[foundIndex]);
  }

  /**
   * Create an outgoing transaction - send stock
   *
   */
  createExternalTransaction(): void {
    this.loading = true;
    this.loaderText = 'Creating transaction';
    const {
      node,
      date,
      type,
      product,
      unit,
      price,
      quantity,
      sellerRefNo,
      buyerRefNo,
    } = this.transactionFormData;
    const params: any = {
      node,
      created_on: Math.floor(new Date(date).getTime() / 1000),
      supply_chain: this.stockService.supplyChainData(),
      type,
      product,
      quantity,
      unit,
      price,
      batches: this.batch,
      buyer_ref_number: buyerRefNo,
      seller_ref_number: sellerRefNo,
    };
    if (this.requestedDetails) {
      params.currency = this.requestedDetails.currency;
      params.transparency_request = this.requestedDetails.id;
    }
    /**
     * transaction created using form data
     * if claims are selected attaching it to transaction id
     * If no claims navigate to listing page after success alert
     */
    const api = this.stockService.createTransaction(params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.transactionId = res.data.id;
          this.loaderText = 'Saving claims';
          // check if claims are selected
          if (this.selectedClaims.length) {
            this.attachClaims();
          } else {
            this.transactionCreated();
          }
        }
      },
      error: () => {
        this.util.customSnackBar(
          'Failed ! Something went wrong',
          ACTION_TYPE.FAILED
        );
        this.loading = false;
      },
    });
    this.pageApis.push(api);
  }

  convertStockTransaction(): void {
    this.loading = true;
    this.loaderText = 'Creating transaction';
    const { items, transactionDate } = this.transactionFormData;
    const destinationBatches = items.map((f: any) => {
      const { product, unit, quantity } = f;
      return {
        product,
        quantity,
        unit,
      };
    });
    const params = {
      type: 1,
      created_on: Math.floor(new Date(transactionDate).getTime() / 1000),
      supply_chain: this.stockService.supplyChainData(),
      destination_batches: destinationBatches,
      source_batches: this.batch,
    };

    this.internalTransactionAPI(params, 1);
  }

  mergeStockTransaction(): void {
    this.loading = true;
    this.loaderText = 'Creating transaction';
    const { date, type, product, unit, quantity } = this.transactionFormData;
    const destBatch = {
      product,
      quantity,
      unit,
    };
    const params = {
      type,
      created_on: new Date(date).getTime() / 1000,
      supply_chain: this.stockService.supplyChainData(),
      destination_batches: [destBatch],
      source_batches: this.batch,
    };
    this.internalTransactionAPI(params, type);
  }

  internalTransactionAPI(params: any, type: number): void {
    const api = this.stockService.mergeStock(params).subscribe(result => {
      if (result.success) {
        this.transactionId = result.data.id;
        if (type === 1) {
          this.loaderText = 'Saving claims data';
          // check if claims are selected
          if (this.selectedClaims.length) {
            this.attachClaims();
          } else {
            this.transactionCreated();
          }
        } else {
          if (this.inheritedClaims.length > 0) {
            const reqObj = {
              transaction: this.transactionId,
              claims: this.inheritedClaims,
            };
            this.inheritClaimAPI(reqObj);
          } else {
            this.transactionCreated();
          }
        }
      }
    });
    this.pageApis.push(api);
  }

  receiveSingleStock(): void {
    this.loading = true;
    this.loaderText = 'Creating incoming transaction';
    const {
      node,
      date,
      type,
      product,
      unit,
      price,
      currency,
      quantity,
      receipt,
    } = this.transactionFormData;
    const formData = new FormData();
    formData.append('invoice', receipt ?? '');
    formData.append('node', node);
    formData.append(
      'created_on',
      Math.floor(new Date(date).getTime() / 1000).toString()
    );
    formData.append('supply_chain', this.stockService.supplyChainData());
    formData.append('type', type);
    formData.append('product', product);
    formData.append('quantity', quantity);
    formData.append('unit', unit);
    formData.append('price', price);
    formData.append('currency', currency);

    const api = this.stockService
      .createTransaction(formData)
      .subscribe((res: any) => {
        if (res.success) {
          this.transactionId = res.data.id;
          this.loaderText = 'Saving claims';
          // check if claims are selected
          if (this.selectedClaims.length) {
            this.attachClaims();
          } else {
            this.transactionCreated();
          }
        }
      });
    this.pageApis.push(api);
  }

  /**
   * 1. Attaching claim id to the transaction
   */
  attachClaims(): void {
    const claimsSelectedNotInherited = this.selectedClaims
      .filter(e => e.selected && !e.inherited)
      .map(cl => {
        return {
          claim: cl.id,
          verifier: cl.verified_by === 2 ? cl.verifier.id : null,
          inherited: false,
        };
      });

    if (claimsSelectedNotInherited.length) {
      const params = {
        transaction: this.transactionId,
        claims: claimsSelectedNotInherited,
      };
      const claimApi = this.claimService.claimAttachApi(params).subscribe({
        next: res => {
          if (res.success) {
            this.attachClaimData();
          }
        },
        error: () => {
          this.transactionCreated();
        },
      });
      this.pageApis.push(claimApi);
    } else {
      this.attachInheritClaims();
    }
  }

  attachClaimData(): void {
    this.loaderText = 'Saving claim data';
    const claimData: any[] = [];
    const fileList: any[] = [];
    this.selectedClaims.map(e => {
      e.criteria.map((c: any) => {
        c.fields.map((f: any) => {
          // check if not file (type 3)
          if (f.type !== 3) {
            claimData.push({
              transaction: '',
              field: f.id,
              response: f.value,
            });
          }
          if (f.type === 3) {
            fileList.push(f.value);
          }
        });
      });
    });

    if (claimData.length > 0) {
      const responseArray = [];
      const errArray = [];
      const claimsLength = claimData.length;
      for (const claim of claimData) {
        claim.transaction = this.transactionId;
        const api = this.claimService.saveClaimData(claim).subscribe(
          (res: any) => {
            responseArray.push(res.success);
            if (responseArray.length === claimsLength) {
              this.attachClaimFiles(fileList);
            }
          },
          (err: any) => {
            errArray.push(err);
            this.transactionCreated();
          }
        );
        this.pageApis.push(api);
      }
    } else if (fileList.length > 0) {
      this.attachClaimFiles(fileList);
    } else {
      this.attachInheritClaims();
    }
  }

  attachClaimFiles(fileList: any[]): void {
    const resArr = [];
    const errArr = [];
    if (fileList.length > 0) {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('field', file.field);
        formData.append('transaction', this.transactionId);
        formData.append('name', file.file.name);
        file.file = formData;
        const api = this.claimService.saveClaimData(formData).subscribe(
          (res: any) => {
            resArr.push(res.success);
            if (resArr.length === fileList.length) {
              this.attachInheritClaims();
            }
          },
          (err: any) => {
            errArr.push(err);
            this.transactionCreated();
          }
        );
        this.pageApis.push(api);
      }
    } else {
      this.attachInheritClaims();
    }
  }

  /**
   * If inherited claim exists
   */
  attachInheritClaims(): void {
    const inheritedClaims = this.selectedClaims
      .filter(e => e.selected && e.inherited)
      .map(cl => {
        return {
          claim: cl.id,
          verifier: null,
          inherited: true,
        };
      });
    if (inheritedClaims.length > 0) {
      // attach inherited claims
      const params = {
        transaction: this.transactionId,
        claims: inheritedClaims,
        transparency_request: this.requestedDetails?.id ?? '',
      };
      this.inheritClaimAPI(params);
    } else {
      this.transactionCreated();
    }
  }

  inheritClaimAPI(params: any): void {
    const api = this.claimService.claimAttachApi(params).subscribe(
      (res: any) => {
        if (res.success) {
          this.transactionCreated();
        }
      },
      err => {
        console.log(err);
        console.log('Failed to attach inheritable claim');
        this.transactionCreated();
      }
    );
    this.pageApis.push(api);
  }

  transactionCreated(): void {
    if (this.actionUrl === '/stock/stock-send') {
      this.util.customSnackBar('Stock sent successfully', ACTION_TYPE.SUCCESS);
    } else if (this.actionUrl === '/stock/process-convert') {
      this.util.customSnackBar(
        'Stock processed successfully',
        ACTION_TYPE.SUCCESS
      );
    } else if (this.actionUrl === '/stock/process-merge') {
      this.util.customSnackBar(
        'Stock merged successfully',
        ACTION_TYPE.SUCCESS
      );
    } else {
      this.util.customSnackBar(
        'Stock received successfully',
        ACTION_TYPE.SUCCESS
      );
    }
    this.loading = false;
    this.processService.navigateToStockListing();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.listingStore.resetState();
  }
}
