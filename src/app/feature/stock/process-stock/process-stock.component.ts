/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// config
import {
  DATE_PROVIDER,
  PROCESS_STOCK_CONFIG,
  StepValues,
  TransactionState,
  stockProcessTabs,
} from './process-stock.config';
import { CLAIM_INHERITANCE_TYPES } from '../../claim/claim.config';

// services
import { StockProcessService } from './stock-process.service';
import { UtilService } from 'src/app/shared/service';
import { StockService } from '../stock.service';
import { ClaimService } from '../../claim';
// store
import { ListingStoreService } from '../listing';
import { GlobalStoreService } from 'src/app/shared/store';
// constants and configs
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { IBatches } from '../listing/listing.model';

let STOCK_PROCESS: ITabItem[];

/**
 * Process stock component should handle internal and external transactions
 * Send stock, merge stock and convert stock
 */
@Component({
  selector: 'app-process-stock',
  templateUrl: './process-stock.component.html',
  styleUrls: ['./process-stock.component.scss'],
  standalone: true,
  imports: PROCESS_STOCK_CONFIG,
  providers: DATE_PROVIDER,
})
export class ProcessStockComponent implements OnInit, OnDestroy {
  pageApis: Subscription[] = [];
  readonly StepValues = StepValues;
  stockTabs: ITabItem[];
  currentStep: string;
  batch: IBatches[] = [];
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

  // new code
  changedBatches: IBatches[];

  constructor(
    public processService: StockProcessService,
    private listingStore: ListingStoreService,
    private stockService: StockService,
    private claimService: ClaimService,
    private store: GlobalStoreService,
    public util: UtilService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.initTabs();
  }

  ngOnInit(): void {
    this.initStep();
    this.initClaimSub();
    this.supplyChainChangedSub();
    this.dataChangesSub();

    if (this.actionUrl !== '/stock/process-merge') {
      this.loaderText = this.translate.instant('stock.loadingCompanyData');
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
      const { batches, changedBatches } = listingInfo;
      this.batch = batches;
      this.changedBatches = changedBatches;
    }
    this.currentStep = StepValues.TRANSACTION;
    this.buttonNextState = {
      action: 'init',
      disabled: true,
      currentStep: this.currentStep,
      buttonText: 'Continue',
    };
  }

  supplyChainChangedSub(): void {
    const supplyChainIdSub = this.util.supplyChainData$.subscribe(
      (res: any) => {
        if (res && res !== this.stockService.supplyChainData()) {
          this.supplyChainChangeAction();
        }
      }
    );
    this.pageApis.push(supplyChainIdSub);
  }

  dataChangesSub(): void {
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

    this.pageApis.push(dataSub);
  }

  /**
   * Initialize subscriptions
   */
  initClaimSub(): void {
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
  }

  /**
   * Supply chain changed action
   */
  supplyChainChangeAction(): void {
    const message = this.translate.instant('processStock.changeSupplychain');
    this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
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
   */
  goToClaims(): void {
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
   */
  mergeStockNavigation(): void {
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
      const id =
        this.actionUrl === '/stock/process-merge'
          ? StepValues.TRANSACTION
          : StepValues.CLAIMS;

      const foundIndex = STOCK_PROCESS.findIndex(s => s.id === id);
      this.changeHistoryTab(this.stockTabs[foundIndex]);
    }
  }

  fromClaims(type: string): void {
    let foundIndex: number;
    if (type === 'next') {
      foundIndex = STOCK_PROCESS.findIndex(s => s.id === StepValues.SUMMARY);
      this.stockTabs = this.stockTabs.map((p: ITabItem) =>
        p.id === StepValues.SUMMARY ? { ...p, active: true } : p
      );
    } else {
      foundIndex = STOCK_PROCESS.findIndex(
        s => s.id === StepValues.TRANSACTION
      );
    }
    this.changeHistoryTab(this.stockTabs[foundIndex]);
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
          this.loaderText = this.translate.instant('stock.loadingClaims');
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

  handleMergeStockClaims(res: any): void {
    this.inheritedClaims = [];
    res.map((e: any) => {
      // only used in merge stock transaction
      this.inheritedClaims.push({
        claim: e.claim,
        verifier: null,
        inherited: true,
      });
    });
    const summaryTabIndex = STOCK_PROCESS.findIndex(
      s => s.id === StepValues.SUMMARY
    );
    this.stockTabs = this.stockTabs.map((p: ITabItem) =>
      p.id === StepValues.SUMMARY ? { ...p, active: true } : p
    );
    this.changeHistoryTab(this.stockTabs[summaryTabIndex]);
  }

  /**
   * Check if inheritable claims are there
   */
  getInheritableClaims(): void {
    if (this.batch.length > 0) {
      const params = {
        batches: this.batch,
        formData: this.transactionFormData,
        actionUrl: this.actionUrl,
      };
      const api = this.claimService
        .getInheritableClaims(params)
        .subscribe((res: any) => {
          if (this.actionUrl === '/stock/process-merge') {
            this.handleMergeStockClaims(res);
          } else {
            this.setInheritableClaims(res);
          }
        });
      this.pageApis.push(api);
    }
  }

  setInheritableClaims(inheritableClaims: any): void {
    if (inheritableClaims.length) {
      this.claimsList.forEach((e: any) => {
        const claim = inheritableClaims.find((f: any) => e.id === f.claim);
        if (claim) {
          e.inherited = true;
          e.selected = true;
          e.disabled = claim.removable ? false : true;
          e.verification_percentage = claim.verification_percentage;
          e.criteria.forEach((criteria: any) => {
            criteria.evidence = claim.criteria;
          });
        }
      });
    } else {
      this.claimsList.forEach((e: any) => {
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
  /* istanbul ignore next */
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
    this.loaderText = this.translate.instant('stock.creatingTransaction');
    const params: any = this.processService.createExternalParams({
      formData: this.transactionFormData,
      batches: this.batch,
      changedBatches: this.changedBatches,
    });

    if (this.requestedDetails) {
      const { currency, id } = this.requestedDetails;
      params.currency = currency;
      params.transparency_request = id;
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
          this.loaderText = this.translate.instant('stock.savingClaimData');
          // check if claims are selected
          if (this.selectedClaims.length) {
            this.attachClaims();
          } else {
            this.completeProcess();
          }
        }
      },
      error: () => {
        this.failedApiCall();
      },
    });
    this.pageApis.push(api);
  }

  convertStockTransaction(): void {
    this.loading = true;
    this.loaderText = this.translate.instant('stock.creatingTransaction');
    const { items, transactionDate } = this.transactionFormData;
    const summary = this.processService.getSummaryData();
    const destinationBatches = items?.map((f: any) => {
      const { product, unit, quantity } = f;
      return {
        product,
        quantity,
        unit,
      };
    });
    const params: any = {
      type: 1,
      created_on: Math.floor(new Date(transactionDate).getTime() / 1000),
      supply_chain: this.stockService.supplyChainData(),
      destination_batches: destinationBatches,
      select_all_batches: summary.selectAll,
    };

    if (summary.selectAll) {
      params.source_batches = this.changedBatches;
    } else {
      params.source_batches = this.batch;
    }

    this.internalTransactionAPI(params, 1);
  }

  mergeStockTransaction(): void {
    this.loading = true;
    this.loaderText = this.translate.instant('stock.creatingTransaction');
    const summary = this.processService.getSummaryData();
    const { date, type, product, unit, quantity } = this.transactionFormData;
    const destBatch = {
      product,
      quantity,
      unit,
    };
    const params: any = {
      type,
      created_on: new Date(date).getTime() / 1000,
      supply_chain: this.stockService.supplyChainData(),
      destination_batches: [destBatch],
      select_all_batches: summary.selectAll,
    };
    if (summary.selectAll) {
      params.source_batches = this.changedBatches;
    } else {
      params.source_batches = this.batch;
    }
    this.internalTransactionAPI(params, type);
  }

  internalTransactionAPI(params: any, type: number): void {
    const api = this.stockService.mergeStock(params).subscribe({
      next: result => {
        if (result.success) {
          this.transactionId = result.data.id;
          if (type === 1) {
            this.loaderText = this.translate.instant('stock.savingClaimData');
            // check if claims are selected
            if (this.selectedClaims.length) {
              this.attachClaims();
            } else {
              this.processService.transactionCreated(this.actionUrl);
              this.loading = false;
            }
          } else {
            if (this.inheritedClaims.length > 0) {
              const reqObj = {
                transaction: this.transactionId,
                claims: this.inheritedClaims,
              };
              this.inheritClaimAPI(reqObj);
            } else {
              this.completeProcess();
            }
          }
        }
      },
      error: () => {
        this.failedApiCall();
      },
    });
    this.pageApis.push(api);
  }

  failedApiCall(): void {
    this.util.customSnackBar(
      this.translate.instant('misc.wentWrong'),
      ACTION_TYPE.FAILED
    );
    this.loading = false;
  }

  receiveSingleStock(): void {
    this.loading = true;
    this.loaderText = this.translate.instant('processStock.incomingLoader');
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

    const api = this.stockService.createTransaction(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.transactionId = res.data.id;
          this.loaderText = this.translate.instant('stock.savingClaimData');
          // check if claims are selected
          if (this.selectedClaims.length) {
            this.attachClaims();
          } else {
            this.completeProcess();
          }
        }
      },
      error: () => {
        this.failedApiCall();
      },
    });
    this.pageApis.push(api);
  }

  /**
   * 1. Attaching claim id to the transaction
   */
  attachClaims(): void {
    const claimsSelectedNotInherited = this.selectedClaims
      ?.filter(e => e.selected && !e.inherited)
      ?.map(cl => {
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
          this.completeProcess();
        },
      });
      this.pageApis.push(claimApi);
    } else {
      this.attachInheritClaims();
    }
  }

  /* istanbul ignore next */
  attachClaimData(): void {
    this.loaderText = this.translate.instant('stock.savingClaimData');
    const claimData: any[] = [];
    const fileList: any[] = [];
    this.selectedClaims?.forEach(e => {
      e.criteria?.map((c: any) => {
        c.fields?.map((f: any) => {
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

    this.callClaimDataApi(claimData, fileList);
  }

  /* istanbul ignore next */
  callClaimDataApi(claimData: any[], fileList: any[]): void {
    if (claimData.length > 0) {
      const responseArray = [];
      const claimsLength = claimData.length;
      for (const claim of claimData) {
        claim.transaction = this.transactionId;
        const api = this.claimService.saveClaimData(claim).subscribe({
          next: (res: any) => {
            responseArray.push(res.success);
            if (responseArray.length === claimsLength) {
              this.attachClaimFiles(fileList);
            }
          },
          error: () => {
            this.completeProcess();
          },
        });
        this.pageApis.push(api);
      }
    } else if (fileList.length > 0) {
      this.attachClaimFiles(fileList);
    } else {
      this.attachInheritClaims();
    }
  }

  /* istanbul ignore next */
  attachClaimFiles(fileList: any[]): void {
    const resArr = [];
    if (fileList.length > 0) {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('field', file.field);
        formData.append('transaction', this.transactionId);
        formData.append('name', file.file.name);
        file.file = formData;
        const api = this.claimService.saveClaimData(formData).subscribe({
          next: (res: any) => {
            resArr.push(res.success);
            if (resArr.length === fileList.length) {
              this.attachInheritClaims();
            }
          },
          error: () => {
            this.completeProcess();
          },
        });
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
      ?.map(cl => {
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
      this.completeProcess();
    }
  }

  /* istanbul ignore next */
  inheritClaimAPI(params: any): void {
    const api = this.claimService.claimAttachApi(params).subscribe(
      (res: any) => {
        if (res.success) {
          this.processService.transactionCreated(this.actionUrl);
          this.loading = false;
        }
      },
      err => {
        console.log(err);
        console.log('Failed to attach inheritable claim');

        this.completeProcess();
      }
    );
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  completeProcess(): void {
    this.processService.transactionCreated(this.actionUrl);
    this.loading = false;
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.listingStore.resetState();
  }
}
