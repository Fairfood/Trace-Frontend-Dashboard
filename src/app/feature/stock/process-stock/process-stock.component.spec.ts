/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { ProcessStockComponent } from './process-stock.component';

import { RECEIVE_STOCK } from './process-stock.constants';
import { StepValues, stockProcessTabs } from './process-stock.config';

import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ITabItem } from 'src/app/shared/configs/app.model';

import { StockProcessService } from './stock-process.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { UtilService } from 'src/app/shared/service';
import { StockService } from '../stock.service';
import { ClaimService } from '../../claim';

class MockGlobalStoreService {
  connectedCompanies$ = new BehaviorSubject([
    { id: 1, name: 'Company A' },
    { id: 2, name: 'Company B' },
  ]);

  claimMasterData$ = new BehaviorSubject([
    {
      id: '1',
      name: 'Claim 1',
    },
    {
      id: '1',
      name: 'Claim 2',
    },
  ]);
}

describe('ProcessStockComponent', () => {
  let component: ProcessStockComponent;
  let fixture: ComponentFixture<ProcessStockComponent>;
  let stockProcesSpy: jasmine.SpyObj<StockProcessService>;
  let router: Router;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let claimServiceSpy: jasmine.SpyObj<ClaimService>;

  beforeEach(waitForAsync(() => {
    utilServiceSpy = jasmine.createSpyObj('UtilService', [
      'supplyChainData$',
      'customSnackBar',
    ]);
    utilServiceSpy.supplyChainData$ = new Subject<string>();
    stockProcesSpy = jasmine.createSpyObj('StockProcessService', [
      'getListingInfo',
      'currentTransactionState',
      'navigateToStockListing',
      'getSummaryData',
      'updateSummaryData',
      'currentClaimState',
      'fetchCurrentUrl',
      'updateListingInfo',
      'updateClaimState',
      'transactionCreated',
      'createExternalParams',
    ]);

    const mockClaimState = {
      claimsList: [
        { selected: true, name: 'Claim 1' },
        { selected: false, name: 'Claim 2' },
      ],
    };

    stockProcesSpy.currentClaimState.and.returnValue(of(mockClaimState));
    const mockTransactionState: any = {
      transactionDetails: {
        product: 'Product 1',
        transactionDate: '2021-01-01',
      },
      requestedData: null,
    };

    stockProcesSpy.currentTransactionState.and.returnValue(
      of(mockTransactionState)
    );

    stockServiceSpy = jasmine.createSpyObj('StockService', [
      'supplyChainData',
      'createTransaction',
      'mergeStock',
    ]);

    stockServiceSpy.supplyChainData.and.returnValue('testSupplyChainId');

    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    claimServiceSpy = jasmine.createSpyObj('ClaimService', [
      'getInheritableClaims',
      'formatClaimsData',
      'claimAttachApi',
    ]);

    TestBed.configureTestingModule({
      imports: [
        ProcessStockComponent,
        HttpClientModule,
        MatSnackBarModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: StockProcessService,
          useValue: stockProcesSpy,
        },
        {
          provide: TranslateService,
          useValue: translateSpy,
        },
        {
          provide: UtilService,
          useValue: utilServiceSpy,
        },
        {
          provide: StockService,
          useValue: stockServiceSpy,
        },
        { provide: GlobalStoreService, useClass: MockGlobalStoreService },
        {
          provide: ClaimService,
          useValue: claimServiceSpy,
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs correctly', () => {
    // Assert that stockTabs is initialized correctly
    expect(component.stockTabs).toEqual(RECEIVE_STOCK);
  });

  describe('ngOnInit', () => {
    it('should call methods on ngOnInit', () => {
      spyOn(component, 'initStep');
      spyOn(component, 'initClaimSub');
      spyOn(component, 'supplyChainChangedSub');
      spyOn(component, 'dataChangesSub');
      spyOn(component, 'getConnectedCompanyList');
      component.actionUrl = '/stock/process-convert';
      // Call ngOnInit
      component.ngOnInit();

      expect(component.initStep).toHaveBeenCalled();
      expect(component.initClaimSub).toHaveBeenCalled();
      expect(component.supplyChainChangedSub).toHaveBeenCalled();
      expect(component.dataChangesSub).toHaveBeenCalled();
      expect(component.getConnectedCompanyList).toHaveBeenCalled();
    });

    it('should not call getConnectedCompanyList while merge stock ', () => {
      component.actionUrl = '/stock/process-merge';
      spyOn(component, 'getConnectedCompanyList');
      // Call ngOnInit
      component.ngOnInit();
      // Assert that loading is set to false
      expect(component.loading).toBeFalsy();
      expect(component.getConnectedCompanyList).not.toHaveBeenCalled();
    });
  });

  describe('initTabs', () => {
    it('should initialize tabs based on action URL: send stock', () => {
      const mockUrl = '/stock/stock-send';
      spyOnProperty(router, 'url').and.returnValue(mockUrl);

      // Call the method
      component.initTabs();

      // Expectations
      expect(component.stockTabs).toEqual(stockProcessTabs('send'));
    });
    it('should initialize tabs based on action URL: convert stock', () => {
      const mockUrl = '/stock/process-convert';
      spyOnProperty(router, 'url').and.returnValue(mockUrl);

      // Call the method
      component.initTabs();

      // Expectations
      expect(component.stockTabs).toEqual(stockProcessTabs('convert'));
    });

    it('should initialize tabs based on action URL: merge stock', () => {
      const mockUrl = '/stock/process-merge';
      spyOnProperty(router, 'url').and.returnValue(mockUrl);

      // Call the method
      component.initTabs();

      // Expectations
      expect(component.stockTabs).toEqual(stockProcessTabs('merge'));
    });
  });

  describe('initStep', () => {
    it('should initialize the step correctly', () => {
      // Call the method
      component.initStep();
      expect(component.currentStep).toEqual(StepValues.TRANSACTION);
      expect(component.buttonNextState).toEqual({
        action: 'init',
        disabled: true,
        currentStep: StepValues.TRANSACTION,
        buttonText: 'Continue',
      });
    });

    it('should initialize the step correctly', () => {
      // arrange
      stockProcesSpy.getListingInfo.and.returnValue({
        batches: [
          {
            batch: 'batch1',
            quantity: 100,
          },
        ],
        changedBatches: [
          {
            batch: 'batch1',
            quantity: 101,
          },
        ],
      });
      // Call the method
      component.initStep();
      expect(component.batch).toEqual([
        {
          batch: 'batch1',
          quantity: 100,
        },
      ]);
      expect(component.changedBatches).toEqual([
        {
          batch: 'batch1',
          quantity: 101,
        },
      ]);
    });
  });

  describe('dataChangesSub', () => {
    it('should subscribe to transaction state changes', () => {
      component.dataChangesSub();

      expect(component.transactionFormData).toEqual({
        product: 'Product 1',
        transactionDate: '2021-01-01',
      });
      expect(component.requestedDetails).toBeUndefined();
    });

    it('should subscribe to transaction state changes', () => {
      stockProcesSpy.currentTransactionState.and.returnValue(
        of({
          transactionDetails: {
            product: 'Product 1',
            transactionDate: '2021-01-01',
          },
          requestedData: {
            product: 'Product 2',
            transactionDate: '2021-01-02',
          },
        })
      );

      component.dataChangesSub();

      expect(component.transactionFormData).toEqual({
        product: 'Product 1',
        transactionDate: '2021-01-01',
      });
      expect(component.requestedDetails).toBeDefined();
    });
  });

  it('should subscribe to supply chain data changes', () => {
    spyOn(component, 'supplyChainChangeAction');

    // Simulate emission of new supply chain data
    utilServiceSpy.supplyChainData$.next('newSupply');

    // Check if supplyChainChangeAction is called
    expect(component.supplyChainChangeAction).toHaveBeenCalled();
  });

  it('should initialize claim subscriptions and update selectedClaims and listOfClaims', () => {
    // Call the method
    component.initClaimSub();

    // Check if selectedClaims and listOfClaims are updated correctly
    expect(component.selectedClaims.length).toBe(1); // Claim 1 is selected
    expect(component.selectedClaims[0].name).toBe('Claim 1');
    expect(component.listOfClaims.length).toBe(2); // Both claims are in the list
  });

  it('should perform supply chain change action correctly', () => {
    translateSpy.instant.and.returnValue('mock message');
    // Call the method
    component.supplyChainChangeAction();

    // Expectations
    expect(translateSpy.instant).toHaveBeenCalledWith(
      'processStock.changeSupplychain'
    ); // Check if the correct message is fetched
    expect(utilServiceSpy.customSnackBar).toHaveBeenCalledWith(
      'mock message',
      ACTION_TYPE.SUCCESS
    ); // Check if customSnackBar is called with the correct arguments
    expect(stockProcesSpy.updateSummaryData).toHaveBeenCalledWith(null); // Check if updateSummaryData is called with null
    expect(stockProcesSpy.updateListingInfo).toHaveBeenCalledWith(null); // Check if updateListingInfo is called with null
    expect(stockProcesSpy.navigateToStockListing).toHaveBeenCalled(); // Check if navigateToStockListing is called
  });

  describe('changeHistoryTab', () => {
    it('should change history tab correctly', () => {
      const mockTabItem: ITabItem = {
        id: 'mockId',
        name: 'Mock Tab',
        active: true,
      };

      component.changeHistoryTab(mockTabItem);

      // Expectations
      expect(stockProcesSpy.getSummaryData).toHaveBeenCalled();
      expect(stockProcesSpy.updateSummaryData).toHaveBeenCalledWith({
        currentStep: 'mockId',
      });
    });

    it('should change history tab correctly', () => {
      component.changeHistoryTab({
        id: StepValues.STOCK,
        name: 'Stock Tab',
        active: true,
      });

      expect(stockProcesSpy.navigateToStockListing).toHaveBeenCalled();
      expect(stockProcesSpy.getSummaryData).toHaveBeenCalled();
    });
  });

  describe('goToClaims', () => {
    it('claimTab active: true', () => {
      const mockClaimTab: ITabItem = {
        id: StepValues.CLAIMS,
        name: 'Claims',
        active: true,
      };
      spyOn(component, 'changeHistoryTab');
      component.stockTabs = [mockClaimTab];

      component.goToClaims();

      expect(component.changeHistoryTab).toHaveBeenCalledWith(mockClaimTab);
    });

    it('claimTab active: false, action url: receive stock', () => {
      const dummy = [{ selected: true, name: 'Claim 1' }];
      const mockClaimTab: ITabItem = {
        id: StepValues.CLAIMS,
        name: 'Claims',
        active: false,
      };
      spyOn(component, 'processClaims');
      component.claimsList = dummy;
      component.stockTabs = [mockClaimTab];
      component.actionUrl = '/stock/receive';

      component.goToClaims();

      expect(component.processClaims).toHaveBeenCalledWith(dummy);
    });

    it('claimTab active: false, action url: receive stock', () => {
      const mockClaimTab: ITabItem = {
        id: StepValues.CLAIMS,
        name: 'Claims',
        active: false,
      };
      spyOn(component, 'getInheritableClaims');
      component.stockTabs = [mockClaimTab];
      component.actionUrl = '/stock/send-stock';

      component.goToClaims();

      expect(component.getInheritableClaims).toHaveBeenCalled();
    });
  });

  describe('mergeStockNavigation', () => {
    it('summaryTab active: true', () => {
      const summaryTab: ITabItem = {
        id: StepValues.SUMMARY,
        name: 'Summary',
        active: true,
      };
      spyOn(component, 'changeHistoryTab');
      component.stockTabs = [summaryTab];

      component.mergeStockNavigation();

      expect(component.changeHistoryTab).toHaveBeenCalledWith(summaryTab);
    });

    it('summaryTab active: false', () => {
      const summaryTab: ITabItem = {
        id: StepValues.SUMMARY,
        name: 'Summary',
        active: false,
      };
      spyOn(component, 'getInheritableClaims');
      component.stockTabs = [summaryTab];

      component.mergeStockNavigation();

      expect(component.getInheritableClaims).toHaveBeenCalled();
    });
  });

  describe('disableClaimtab', () => {
    it('should disable claim tab when action is set to disable', () => {
      // Mock stock tabs with active claim tab
      component.stockTabs = RECEIVE_STOCK;
      component.stockTabs[1].active = true;

      // Call the method with action set to 'disable'
      component.disableClaimTab('disable');

      // Expectations
      expect(component.stockTabs[1].active).toBe(false); // Check if the claim tab is now inactive
    });

    it('should not disable claim tab if action is not set to disable', () => {
      // Mock stock tabs with active claim tab
      component.stockTabs = RECEIVE_STOCK;
      component.stockTabs[1].active = false;

      // Call the method with action set to something other than 'disable'
      component.disableClaimTab('enable');

      // Expectations
      expect(component.stockTabs[1].active).toBe(false); // Check if the claim tab remains active
    });
  });

  describe('fromSummary', () => {
    it('should perform appropriate action when type is "next"', () => {
      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: false });
      component.actionUrl = '/stock/stock-send';
      spyOn(component, 'createExternalTransaction');
      // Call the method with type set to 'next'
      component.fromSummary('next');

      // Expectations
      expect(component.createExternalTransaction).toHaveBeenCalled(); // Check if createExternalTransaction is called
    });

    it('should perform appropriate action when type is "next"', () => {
      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: false });
      spyOn(component, 'convertStockTransaction');
      // Change action URL to '/stock/process-convert'
      component.actionUrl = '/stock/process-convert';

      // Call the method with type set to 'next'
      component.fromSummary('next');

      // Expectations
      expect(component.convertStockTransaction).toHaveBeenCalled();
    });
    it('should perform appropriate action when type is "next"', () => {
      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: false });
      spyOn(component, 'mergeStockTransaction');
      // Change action URL to '/stock/process-merge'
      component.actionUrl = '/stock/process-merge';

      // Call the method with type set to 'next'
      component.fromSummary('next');

      // Expectations
      expect(component.mergeStockTransaction).toHaveBeenCalled();
    });

    it('should perform appropriate action when type is "next"', () => {
      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: false });
      spyOn(component, 'receiveSingleStock');
      // Change action URL to '/stock/receive'
      component.actionUrl = '/stock/receive';

      // Call the method with type set to 'next'
      component.fromSummary('next');

      // Expectations
      expect(component.receiveSingleStock).toHaveBeenCalled();
    });

    it('should perform appropriate action when type is "prev"', () => {
      spyOn(component, 'changeHistoryTab');
      // Change action URL to '/stock/receive'
      component.actionUrl = '/stock/process-merge';

      // Call the method with type set to 'next'
      component.fromSummary('prev');

      // Expectations
      expect(component.changeHistoryTab).toHaveBeenCalled();
    });
  });

  describe('fromClaims', () => {
    it('should perform appropriate action when type is "next"', () => {
      spyOn(component, 'changeHistoryTab');
      component.actionUrl = '/stock/stock-send';

      // Call the method with type set to 'next'
      component.fromClaims('next');

      // Expectations
      expect(component.changeHistoryTab).toHaveBeenCalled();
      expect(
        component.stockTabs.find(s => s.id === StepValues.SUMMARY)?.active
      ).toBe(true); // Check if the SUMMARY tab is set to active
    });

    it('should perform appropriate action when type is not "next"', () => {
      spyOn(component, 'changeHistoryTab');
      component.actionUrl = '/stock/process-merge';

      // Call the method with type set to anything other than 'next'
      component.fromClaims('prev');

      // Expectations
      expect(component.changeHistoryTab).toHaveBeenCalled();
    });
  });

  it('updateSummaryData should work as expected', () => {
    component.updateSummaryData();
    expect(stockProcesSpy.updateSummaryData).toHaveBeenCalled();
    expect(stockProcesSpy.getSummaryData).toHaveBeenCalled();
  });

  it('should fetch connected companies and load claims on successful response', () => {
    const mockCompanies = [
      { id: 1, name: 'Company A' },
      { id: 2, name: 'Company B' },
    ];
    component.getConnectedCompanyList();

    expect(component.companies).toEqual(mockCompanies); // Check if companies are correctly set
  });

  describe('getInheritableClaims', () => {
    it('should call appropriate service method when batch length is greater than 0', () => {
      spyOn(component, 'handleMergeStockClaims');

      component.batch = [
        { batch: '1', quantity: 1 },
        { batch: '2', quantity: 1 },
      ];

      component.transactionFormData = {
        product: 'Product 1',
      };

      const mockParams = {
        batches: [
          { batch: '1', quantity: 1 },
          { batch: '2', quantity: 1 },
        ],
        formData: {
          product: 'Product 1',
        },
        actionUrl: '/stock/process-merge',
      };

      const mockResponse = [
        { id: 1, name: 'Claim 1' },
        { id: 2, name: 'Claim 2' },
      ];

      component.actionUrl = '/stock/process-merge';

      claimServiceSpy.getInheritableClaims.and.returnValue(of(mockResponse));
      component.getInheritableClaims();

      // Expectations
      expect(claimServiceSpy.getInheritableClaims).toHaveBeenCalledWith(
        mockParams
      );
      expect(component.handleMergeStockClaims).toHaveBeenCalledWith(
        mockResponse
      );
    });

    it('should call appropriate service method when batch length is greater than 0', () => {
      spyOn(component, 'setInheritableClaims');

      component.batch = [
        { batch: '1', quantity: 1 },
        { batch: '2', quantity: 1 },
      ];

      component.transactionFormData = {
        product: 'Product 1',
      };

      const mockParams = {
        batches: [
          { batch: '1', quantity: 1 },
          { batch: '2', quantity: 1 },
        ],
        formData: {
          product: 'Product 1',
        },
        actionUrl: '/stock/process-send',
      };

      const mockResponse = [
        { id: 1, name: 'Claim 1' },
        { id: 2, name: 'Claim 2' },
      ];

      component.actionUrl = '/stock/process-send';

      claimServiceSpy.getInheritableClaims.and.returnValue(of(mockResponse));
      component.getInheritableClaims();

      // Expectations
      expect(claimServiceSpy.getInheritableClaims).toHaveBeenCalledWith(
        mockParams
      );
      expect(component.setInheritableClaims).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('should correctly handle merge stock claims response', () => {
    spyOn(component, 'changeHistoryTab');
    const mockResponse = [{ claim: 'Claim 1' }, { claim: 'Claim 2' }];

    component.handleMergeStockClaims(mockResponse);

    expect(component.inheritedClaims).toEqual([
      { claim: 'Claim 1', verifier: null, inherited: true },
      { claim: 'Claim 2', verifier: null, inherited: true },
    ]);
    expect(
      component.stockTabs.find(s => s.id === StepValues.SUMMARY)?.active
    ).toBe(true); // Check if SUMMARY tab is set to active
    expect(component.changeHistoryTab).toHaveBeenCalledWith(
      component.stockTabs.find(s => s.id === StepValues.SUMMARY)
    );
  });

  describe('setInheritableClaims', () => {
    it('should properly set inheritable claims when inheritableClaims is not empty', () => {
      const mockClaimState = [
        {
          removable: true,
          verification_percentage: 80,
          criteria: [
            {
              id: '121',
              name: 'asdasd',
              description: '',
            },
          ],
          id: '1',
          name: '',
        },
        {
          removable: false,
          verification_percentage: 90,
          criteria: [
            {
              id: '121',
              name: 'asdasd',
              description: '',
            },
          ],
          id: '2',
          name: '',
        },
      ];
      component.claimsList = mockClaimState;
      // Mock data
      const inheritableClaims = [
        {
          claim: '1',
          removable: true,
          verification_percentage: 80,
          criteria: 'criteria1',
        },
        {
          claim: '2',
          removable: false,
          verification_percentage: 90,
          criteria: 'criteria2',
        },
      ];

      spyOn(component, 'processClaims');

      // Call the method
      component.setInheritableClaims(inheritableClaims);

      // Assertions
      expect(component.claimsList[0].inherited).toBe(true);
      expect(component.claimsList[0].selected).toBe(true);
      expect(component.claimsList[0].disabled).toBe(false);
      expect(component.claimsList[0].verification_percentage).toBe(80);
      expect(component.claimsList[0].criteria[0].evidence).toBe('criteria1');

      expect(component.claimsList[1].inherited).toBe(true);
      expect(component.claimsList[1].selected).toBe(true);
      expect(component.claimsList[1].disabled).toBe(true);
      expect(component.claimsList[1].verification_percentage).toBe(90);
      expect(component.claimsList[1].criteria[0].evidence).toBe('criteria2');

      // Verify if processClaims is called with the updated claimsList
      expect(component.processClaims).toHaveBeenCalledWith(
        component.claimsList
      );
    });

    it('should properly set inheritable claims when inheritableClaims is empty', () => {
      // Mock data
      const mockClaimState = [
        {
          removable: true,
          verification_percentage: 80,
          criteria: [
            {
              id: '121',
              name: 'asdasd',
              description: '',
            },
          ],
          id: '1',
          name: '',
          inherited: false,
          selected: false,
        },
        {
          removable: false,
          verification_percentage: 90,
          criteria: [
            {
              id: '121',
              name: 'asdasd',
              description: '',
            },
          ],
          id: '2',
          name: '',
          inherited: false,
          selected: false,
        },
      ];
      component.claimsList = mockClaimState;
      const inheritableClaims: any = [];
      spyOn(component, 'processClaims');
      component.setInheritableClaims(inheritableClaims);

      // Assertions
      expect(component.claimsList[0].inherited).toBe(false);
      expect(component.claimsList[0].selected).toBe(false);
      expect(component.processClaims).toHaveBeenCalledWith(
        component.claimsList
      );
    });
  });

  describe('attachInheritClaims', () => {
    it('should call inheritClaimAPI with correct parameters when there are inherited claims', () => {
      // Mock data
      const inheritedClaims = [
        { id: 1, selected: true, inherited: true },
        { id: 2, selected: true, inherited: true },
      ];
      component.selectedClaims = inheritedClaims;
      component.transactionId = 'transactionId';
      component.requestedDetails = { id: 'requestedDetailsId' };

      // Spy on inheritClaimAPI method
      spyOn(component, 'inheritClaimAPI');

      // Call the method
      component.attachInheritClaims();

      // Assertions
      expect(component.inheritClaimAPI).toHaveBeenCalledWith({
        transaction: 'transactionId',
        claims: [
          { claim: 1, verifier: null, inherited: true },
          { claim: 2, verifier: null, inherited: true },
        ],
        transparency_request: 'requestedDetailsId',
      });
    });

    it('should not call inheritClaimAPI when there are no inherited claims', () => {
      // Mock data
      const selectedClaims = [{ id: 1, selected: true, inherited: false }];
      component.selectedClaims = selectedClaims;

      // Spy on inheritClaimAPI method
      spyOn(component, 'inheritClaimAPI');

      // Call the method
      component.attachInheritClaims();

      // Assertions
      expect(component.inheritClaimAPI).not.toHaveBeenCalled();
      expect(stockProcesSpy.transactionCreated).toHaveBeenCalled();
      expect(component.loading).toBeFalse(); // Assumes loading is set to true before the method is called
    });
  });

  describe('attachClaims', () => {
    it('should call claimAttachApi and attachClaimData on successful claim attachment', () => {
      // Mock data
      const claimsSelectedNotInherited = [
        {
          id: 1,
          selected: true,
          inherited: false,
          verified_by: 2,
          verifier: { id: 'verifierId' },
        },
        {
          id: 2,
          selected: true,
          inherited: false,
          verified_by: 2,
          verifier: { id: 'verifierId' },
        },
      ];
      component.selectedClaims = claimsSelectedNotInherited;
      component.transactionId = 'transactionId';

      claimServiceSpy.claimAttachApi.and.returnValue(of({ success: true }));

      // Call the method
      component.attachClaims();

      // Assertions
      expect(claimServiceSpy.claimAttachApi).toHaveBeenCalledWith({
        transaction: 'transactionId',
        claims: [
          { claim: 1, verifier: 'verifierId', inherited: false },
          { claim: 2, verifier: 'verifierId', inherited: false },
        ],
      });
    });

    it('should call attachInheritClaims when there are no claims selected that are not inherited', () => {
      // Mock data
      const selectedClaims = [{ id: 1, selected: true, inherited: true }];
      component.selectedClaims = selectedClaims;

      // Spy on attachInheritClaims method
      const attachInheritClaimsSpy = spyOn(component, 'attachInheritClaims');

      // Call the method
      component.attachClaims();

      // Assertions
      expect(attachInheritClaimsSpy).toHaveBeenCalled();
    });
  });

  describe('createExternalTransaction', () => {
    it('should create transaction and attach claims when successful', () => {
      // Mock data
      component.loading = false;
      component.transactionFormData = {};
      component.batch = [];
      component.changedBatches = [];
      component.requestedDetails = null;
      component.selectedClaims = [
        {
          id: 1,
          selected: true,
          inherited: false,
          verified_by: 2,
          verifier: { id: 'verifierId' },
        },
      ];
      spyOn(component, 'attachClaims');

      stockServiceSpy.createTransaction.and.returnValue(
        of({ success: true, data: { id: 'transactionId' } })
      );

      // Call the method
      component.createExternalTransaction();

      // Assertions
      expect(component.loading).toBeTrue();
      expect(component.attachClaims).toHaveBeenCalled();
    });

    it('should create transaction and attach claims when successful', () => {
      // Mock data
      component.loading = false;
      component.transactionFormData = {};
      component.batch = [];
      component.changedBatches = [];
      component.requestedDetails = null;
      component.selectedClaims = [];
      component.actionUrl = '/stock/stock-send';
      spyOn(component, 'attachClaims');

      stockServiceSpy.createTransaction.and.returnValue(
        of({ success: true, data: { id: 'transactionId' } })
      );

      // Call the method
      component.createExternalTransaction();

      // Assertions
      expect(component.loading).toBeFalse();
      expect(component.attachClaims).not.toHaveBeenCalled();
      expect(stockProcesSpy.transactionCreated).toHaveBeenCalledWith(
        '/stock/stock-send'
      );
    });

    it('should handle error when transaction creation fails', () => {
      // Mock data
      component.loading = false;
      stockServiceSpy.createTransaction.and.returnValue(throwError('Error'));
      translateSpy.instant.and.returnValue('misc.wentWrong');
      // Call the method
      component.createExternalTransaction();

      // Assertions
      expect(component.loading).toBeFalse();
      expect(component.util.customSnackBar).toHaveBeenCalledWith(
        'misc.wentWrong',
        ACTION_TYPE.FAILED
      );
    });
  });

  it('convertStockTransaction should prepare parameters and call internalTransactionAPI with correct data', () => {
    // Mock data
    component.loading = false;
    component.transactionFormData = {
      transactionDate: '2021-01-01',
      items: [{ product: 'test', unit: 'kg', quantity: 100 }],
    };
    component.batch = [];
    component.changedBatches = [];
    spyOn(component, 'internalTransactionAPI');

    stockProcesSpy.getSummaryData.and.returnValue({ selectAll: true });

    // Call the method
    component.convertStockTransaction();

    // Assertions
    expect(component.loading).toBeTrue();
    expect(component.internalTransactionAPI).toHaveBeenCalledWith(
      {
        type: 1,
        created_on: jasmine.any(Number), // Ensure created_on is a number
        supply_chain: 'testSupplyChainId',
        destination_batches: [{ product: 'test', unit: 'kg', quantity: 100 }], // Ensure destination_batches is an array
        select_all_batches: true,
        source_batches: component.changedBatches,
      },
      1
    );
  });

  describe('mergeStockTransaction', () => {
    it('mergeStockTransaction should prepare parameters and call internalTransactionAPI with correct data', () => {
      // Mock data
      component.loading = false;
      component.transactionFormData = {
        date: '2021-01-01',
        type: 3,
        product: 'test',
        unit: 'kg',
        quantity: 100,
      };
      component.batch = [];
      component.changedBatches = [];
      spyOn(component, 'internalTransactionAPI');

      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: true });

      // Call the method
      component.mergeStockTransaction();

      // Assertions
      expect(component.loading).toBeTrue();
      expect(component.internalTransactionAPI).toHaveBeenCalledWith(
        {
          type: jasmine.any(Number), // Ensure type is a number
          created_on: jasmine.any(Number), // Ensure created_on is a number
          supply_chain: 'testSupplyChainId',
          destination_batches: [{ product: 'test', unit: 'kg', quantity: 100 }],
          select_all_batches: true,
          source_batches: component.changedBatches,
        },
        jasmine.any(Number)
      );
    });
    it('mergeStockTransaction should prepare parameters and call internalTransactionAPI with correct data select all false', () => {
      // Mock data
      component.loading = false;
      component.transactionFormData = {
        date: '2021-01-01',
        type: 3,
        product: 'test',
        unit: 'kg',
        quantity: 100,
      };
      component.batch = [
        {
          batch: '1',
          quantity: 100,
        },
      ];
      component.changedBatches = [];
      spyOn(component, 'internalTransactionAPI');

      stockProcesSpy.getSummaryData.and.returnValue({ selectAll: false });

      // Call the method
      component.mergeStockTransaction();

      // Assertions
      expect(component.loading).toBeTrue();
      expect(component.internalTransactionAPI).toHaveBeenCalledWith(
        {
          type: jasmine.any(Number), // Ensure type is a number
          created_on: jasmine.any(Number), // Ensure created_on is a number
          supply_chain: 'testSupplyChainId',
          destination_batches: [{ product: 'test', unit: 'kg', quantity: 100 }],
          select_all_batches: false,
          source_batches: component.batch,
        },
        jasmine.any(Number)
      );
    });
  });

  describe('internalTransactionAPI', () => {
    it('should handle successful API call for type 1', () => {
      // Mock data
      const mockResult = { success: true, data: { id: 123 } };
      component.selectedClaims = [
        {
          id: 1,
          selected: true,
          inherited: false,
          verified_by: 2,
          verifier: { id: 'verifierId' },
        },
      ];
      spyOn(component, 'attachClaims');

      stockServiceSpy.mergeStock.and.returnValue(of(mockResult));

      // Call the method
      component.internalTransactionAPI(
        {
          type: jasmine.any(Number), // Ensure type is a number
          created_on: jasmine.any(Number), // Ensure created_on is a number
          supply_chain: 'testSupplyChainId',
          destination_batches: [{ product: 'test', unit: 'kg', quantity: 100 }],
          select_all_batches: true,
          source_batches: component.changedBatches,
        },
        1
      );

      // Assertions
      expect(component.transactionId).toEqual(mockResult.data.id);
      expect(component.attachClaims).toHaveBeenCalled();
      expect(
        component.processService.transactionCreated
      ).not.toHaveBeenCalled();
      expect(component.util.customSnackBar).not.toHaveBeenCalled();
    });

    it('should handle successful API call for type other than 1', () => {
      // Mock data
      const mockResult = { success: true, data: { id: 123 } };
      component.inheritedClaims = [
        {
          id: 1,
          selected: true,
          inherited: true,
          verified_by: 2,
          verifier: { id: 'verifierId' },
        },
      ];
      spyOn(component, 'inheritClaimAPI');
      stockServiceSpy.mergeStock.and.returnValue(of(mockResult));

      // Call the method
      component.internalTransactionAPI(
        {
          type: jasmine.any(Number), // Ensure type is a number
          created_on: jasmine.any(Number), // Ensure created_on is a number
          supply_chain: 'testSupplyChainId',
          destination_batches: [{ product: 'test', unit: 'kg', quantity: 100 }],
          select_all_batches: true,
          source_batches: component.changedBatches,
        },
        2
      ); // Assuming type other than 1

      // Assertions
      expect(component.transactionId).toEqual(mockResult.data.id);
      expect(component.inheritClaimAPI).toHaveBeenCalled();
      expect(
        component.processService.transactionCreated
      ).not.toHaveBeenCalled();
      expect(component.util.customSnackBar).not.toHaveBeenCalled();
    });

    it('should handle error when API call fails', () => {
      stockServiceSpy.mergeStock.and.returnValue(throwError('Error'));
      translateSpy.instant.and.returnValue('misc.wentWrong');
      // Call the method
      component.internalTransactionAPI(jasmine.any(Object), 1); // Assuming type 1

      // Assertions
      expect(component.util.customSnackBar).toHaveBeenCalledWith(
        'misc.wentWrong',
        ACTION_TYPE.FAILED
      );
      expect(
        component.processService.transactionCreated
      ).not.toHaveBeenCalled();
    });
  });

  describe('receiveSingleStock', () => {
    it('should handle successful API call', () => {
      // Mock data
      const mockResult = { success: true, data: { id: 123 } };
      spyOn(component, 'attachClaims');
      stockServiceSpy.createTransaction.and.returnValue(of(mockResult));

      // Call the method
      component.receiveSingleStock();

      // Assertions
      expect(component.transactionId).toEqual(mockResult.data.id);
      expect(component.attachClaims).toHaveBeenCalled();
      expect(stockProcesSpy.transactionCreated).not.toHaveBeenCalled();
      expect(component.util.customSnackBar).not.toHaveBeenCalled();
    });

    it('should handle error when API call fails', () => {
      spyOn(component, 'failedApiCall');
      stockServiceSpy.createTransaction.and.returnValue(throwError('Error'));

      // Call the method
      component.receiveSingleStock();

      expect(component.failedApiCall).toHaveBeenCalled();
    });
  });
});
