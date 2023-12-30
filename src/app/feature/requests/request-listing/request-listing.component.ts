/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
// material
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
// services
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { RequestListingService } from './request-listing.service';
// config
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ICommonObj } from 'src/app/shared/configs/app.model';
// components
import { CreateRequestComponent } from '../create-request';
import { RequestResponseComponent } from '../request-response';
import { DeclineRequestComponent } from '../decline-request';
import { RemovetransparencyRequestComponent } from '../remove-transparency-request';
import { RequestForInfoComponent } from '../request-for-info';

@Component({
  selector: 'app-request-listing',
  templateUrl: './request-listing.component.html',
  styleUrls: ['./request-listing.component.scss'],
})
export class RequestListingComponent implements OnInit, OnDestroy {
  requestTypeList: any[];
  statusList: any[];

  requestList: any[] = [];
  selectedClaims: any[] = [];
  claims1: any = [];
  addClaims: any = [];
  claimsList: any;

  profileData: any;
  selectedRequest: any;
  companyClaims: any;
  addedClaims: any;
  requestDetails: any;
  requestId: any;

  memberType: any;

  respondedRequest = true;
  showRequest = false;
  detailsLoaded = false;
  dataLoaded = false;
  linkedTransaction = false;
  editOrder = false;
  linktransparencyRequest = false;
  claimSelected: boolean;
  step = 1;
  fileList: any = [];
  fileCount = 0;
  fieldDataCount = 0;
  showattachEvidencePopup = false;
  publicClaimAttached = false;

  pageApis: Subscription[] = [];
  tabGroup: ICommonObj[] = [
    {
      id: 'incoming',
      name: this.translate.instant('requests.direction1'),
    },
    {
      id: 'outgoing',
      name: this.translate.instant('requests.direction2'),
    },
  ];
  activeTab = 'incoming';

  appliedFilterValues: any;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private routes: ActivatedRoute,
    private translateService: TranslateService,
    private service: RequestListingService,
    private util: UtilService,
    private global: GlobalStoreService,
    private translate: TranslateService
  ) {
    this.requestTypeList = [
      { id: 1, name: this.translateService.instant('requests.type1') },
      { id: 2, name: this.translateService.instant('requests.type2') },
      { id: 3, name: this.translateService.instant('requests.type3') },
      { id: 4, name: this.translateService.instant('requests.type4') },
    ];

    this.statusList = this.fetchStatusList(0);
  }

  ngOnInit(): void {
    // Fetching parameters from request url
    this.requestId = this.routes.snapshot.params.id;
    const direction = this.routes.snapshot.params.direction;
    this.memberType = +localStorage.getItem('memberType');

    // Incoming or outgoing requests
    if (direction) {
      this.appliedFilterValues = {
        searchText: '',
        direction,
        requestType: '',
        status: '',
      };
    } else {
      this.appliedFilterValues = {
        searchText: '',
        direction: 1,
        requestType: '',
        status: '',
      };
    }
    this.getRequests();
  }

  getRequests(): void {
    const api = this.service
      .getRequestslist(this.appliedFilterValues)
      .subscribe((res: any) => {
        this.requestList = res.results;
        if (this.requestList.length !== 0) {
          this.selectRequest(this.requestList[0]);
        }
        this.dataLoaded = true;
      });
    this.pageApis.push(api);
  }

  // Get selected request details
  selectRequest(request: any): void {
    this.detailsLoaded = false;
    this.selectedRequest = request.id;
    // Load stock request or transparency request details(rrquest type 1)
    if (request.request_type === 1) {
      const api = this.service
        .getStockRequestDetails(this.selectedRequest)
        .subscribe((res: any) => {
          this.requestDetails = res.data;
          // checking request status
          if (this.requestDetails.status === 1) {
            this.showRequest = true;
          }
          this.detailsLoaded = true;
        });
      this.pageApis.push(api);
    } else if (request.request_type === 2 || request.request_type === 3) {
      // load claim request details (request for information or public claim)
      const api = this.service
        .getClaimRequestDetails(this.selectedRequest)
        .subscribe((res: any) => {
          this.requestDetails = res.data;
          // checking request status
          if (this.requestDetails.status === 1) {
            this.showRequest = true;
          }
          if (request.request_type === 3) {
            this.checkPrivateClaim(this.requestDetails);
          } else if (request.request_type === 2) {
            this.checkPublicClaim();
          } else {
            this.detailsLoaded = true;
          }
        });
      this.pageApis.push(api);
    } else if (request.request_type === 4) {
      // load map supplier request details
      const api = this.service
        .getMapSupplierRequestDetails(this.selectedRequest)
        .subscribe((res: any) => {
          this.requestDetails = res.data;
          // checking request status
          if (this.requestDetails.status === 1) {
            this.showRequest = true;
          }
          this.detailsLoaded = true;
        });
      this.pageApis.push(api);
    }
    this.showRequest = false;
  }

  // check private claim
  checkPrivateClaim(data: any): void {
    this.fileCount = 0;
    this.fieldDataCount = 0;
    this.fileList = [];
    data.fields.filter((field: any) => {
      if (field.type === 3) {
        this.fileCount++;
        field.changed = false;
      } else {
        this.fieldDataCount++;
      }
    });
    this.detailsLoaded = true;
  }

  // Check public claim
  checkPublicClaim() {
    let attachedClaims = [];
    this.publicClaimAttached = false;
    const node_id = localStorage.getItem('companyID');
    const api = this.service
      .listCompanyClaims(node_id)
      .subscribe((res: any) => {
        attachedClaims = res.data.results;
        attachedClaims.filter((e: any) => {
          if (e.claim_id === this.requestDetails.claim.id) {
            this.publicClaimAttached = true;
          }
        });
        this.detailsLoaded = true;
      });
    this.pageApis.push(api);
  }

  fetchStatusList(type: number): any[] {
    const statuses = [
      { id: 1, name: this.translateService.instant('home.chart.status3') },
      { id: 2, name: this.translateService.instant('requests.status2') },
      { id: 3, name: this.translateService.instant('requests.status3') },
    ];
    if (type === 1) {
      return [...statuses];
    }
    return [
      ...statuses,
      {
        id: 4,
        name: this.translateService.instant('requests.status4'),
      },
    ];
  }

  // Open create request pop up
  createRequest(): void {
    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '50vw',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.success) {
          // show snackbar and update requests list
          const message = this.translateService.instant(
            'requests.snackbar.reqSent'
          );
          this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.dataLoaded = false;
          this.appliedFilterValues = {
            searchText: '',
            status: '',
            requestType: '',
            direction: 1,
          };
          this.getRequests();
        }
      }
    });
  }

  createInformationRequest(): void {
    const dialogRef = this.dialog.open(RequestForInfoComponent, {
      width: '50vw',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result);
      }
    });
  }

  // respond to requests ie reject or accept requests
  respond(item: any): void {
    if (item.request_type === 3) {
      // respond to information request
      const dialogRef = this.dialog.open(RequestResponseComponent, {
        disableClose: true,
        width: '581px',
        height: 'auto',
        data: item,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dataLoaded = false;
          this.getRequests();
        }
      });
    }
    // else if (item.request_type === 2) {
    //   // respond to public claim request
    //   const dialogRef = this.dialog.open(AddCompanyClaimComponent, {
    //     disableClose: true,
    //     width: '677px',
    //     height: 'auto',
    //     data: {
    //       type: 'public',
    //       claims: '',
    //       publicClaim: item,
    //     },
    //   });
    //   dialogRef.afterClosed().subscribe(result => {
    //     if (result) {
    //       const message = this.translateService.instant(
    //         'companyProfile.snackbar.claimAdded'
    //       );
    //       this._dataService.customSnackBar(message, ACTION_TYPE.SUCCESS);
    //       this.getRequests(item);
    //     }
    //   });
    // }
  }

  // pop up to decline request
  declineRequest(): void {
    const dialogRef = this.dialog.open(DeclineRequestComponent, {
      disableClose: true,
      width: '581px',
      height: 'auto',
      data: this.requestDetails,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.success) {
          const message = this.translateService.instant(
            'requests.snackbar.reqDeclined'
          );
          this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.dataLoaded = false;
          this.getRequests();
        } else {
          const message = this.translateService.instant(
            'requests.snackbar.failedToDeny'
          );
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      }
    });
  }

  // Reject or remove stock request
  removetransparencyRequest(): void {
    const { direction } = this.appliedFilterValues;
    const dialogRef = this.dialog.open(RemovetransparencyRequestComponent, {
      width: '40vw',
      height: 'auto',
      data: {
        requestType: direction,
        type: 'details',
        id: this.requestDetails.id,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.success) {
          let message;
          if (direction === 1) {
            message = this.translateService.instant(
              'requests.snackbar.reqRejected'
            );
          } else {
            message = this.translateService.instant(
              'requests.snackbar.reqRemoved'
            );
          }
          this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.dataLoaded = false;
          this.getRequests();
        } else {
          let message;
          if (direction === 1) {
            message = this.translateService.instant(
              'requests.snackbar.failedToRemove'
            );
          } else {
            message = this.translateService.instant(
              'requests.snackbar.failedToReject'
            );
          }
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      }
    });
  }

  // get stock request details
  getProfileData(id: string): void {
    const api = this.service
      .getTransparencyRequestDetails(id)
      .subscribe((res: any) => {
        this.profileData = res['data'];
        if (this.profileData.transaction.id) {
          this.linkedTransaction = true;
        }
        this.getSelectedClaims();
      });
    this.pageApis.push(api);
  }

  // method to select and deselect claims
  selectClaim(index: number): void {
    this.claims1[index].selected = !this.claims1[index].selected;
  }

  // Get selected claims
  getSelectedClaims(): void {
    this.selectedClaims = this.profileData.claims;
    this.claims1.filter((e: any) => {
      this.selectedClaims.filter(el => {
        if (e.id === el.id) {
          e.selected = true;
        }
      });
    });
    this.dataLoaded = true;
  }

  // method to get claims based on supply chain
  getClaims(): void {
    const chainId = localStorage.getItem('supplyChainId');
    const api = this.service.getClaims(chainId).subscribe((claims: any) => {
      this.claimsList = claims.data.results;
      this.claimsList.filter((e: any) => {
        this.claims1.push({ id: e.id, name: e.name, selected: false });
      });
    });
    this.pageApis.push(api);
  }

  // Go to send stock page
  sendStock(): void {
    this.util.linkedTransparencyRequestData = this.requestDetails;
    localStorage.setItem(
      'supplyChainId',
      this.requestDetails.product.supply_chain.id
    );
    this.router.navigate(['/stock', 'stock-send']);
  }

  // Go to transaction details page
  viewTransactionDetails(id: string): void {
    this.router.navigate(['transaction-report', 'external', id]);
  }

  // Map suppliers
  mapSupplier(data: any): void {
    if (data.request_type === 4) {
      const params = {
        status: 4,
      };
      const api = this.service
        .updateMapSupplierRequest(data.id, params)
        .subscribe(() => {
          this.router.navigate(['/connections']);
        });
      this.pageApis.push(api);
    }
  }

  // attach evidence for claims
  attachEvidence(): void {
    let fieldCount = 0;
    let files_count = 0;
    this.requestDetails.fields.forEach((field: any) => {
      // get evidence count (files and fields)
      if (field.type !== 3) {
        if (field.response !== '') {
          fieldCount++;
        }
      } else {
        if (field.file) {
          files_count++;
        }
      }
    });
    if (fieldCount === this.fieldDataCount && this.fileCount === files_count) {
      this.requestDetails.fields.forEach((field: any) => {
        // add / update evidence data
        if (field.type !== 3) {
          if (field.response !== '' && field.changed) {
            const formData = new FormData();
            formData.append('response', field.response);
            formData.append('field', field.id);
            const api = this.service
              .addClaimResponse(field.id, formData)
              .subscribe({
                error: () => {
                  const message = this.translateService.instant(
                    'requests.snackbar.failedToUpdateData'
                  );
                  this.util.customSnackBar(message, ACTION_TYPE.FAILED);
                },
              });
            this.pageApis.push(api);
          }
        }
      });
      for (const file of this.fileList) {
        if (file.changed) {
          const formData = new FormData();
          formData.append('file', file.file);
          formData.append('field', file.field);
          const api = this.service
            .addClaimResponse(file.field, formData)
            .subscribe({
              error: () => {
                const message = this.translateService.instant(
                  'requests.snackbar.failedFile'
                );
                this.util.customSnackBar(message, ACTION_TYPE.FAILED);
              },
            });

          this.pageApis.push(api);
        }
      }

      const attachAPI = this.service
        .attachPrivateClaim(this.requestDetails.id, '')
        .subscribe((res: any) => {
          if (res.success) {
            let message;
            if (this.requestDetails.claim_attached) {
              message = this.translateService.instant(
                'requests.snackbar.evidenceUpdated'
              );
            } else {
              message = this.translateService.instant(
                'requests.snackbar.evidenceAttach'
              );
            }
            this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
            this.dataLoaded = false;
            this.getRequests();
          } else {
            const message = this.translateService.instant(
              'requests.snackbar.failedAttachFile'
            );
            this.util.customSnackBar(message, ACTION_TYPE.FAILED);
          }
        });
      this.pageApis.push(attachAPI);
    } else {
      const message = this.translateService.instant(
        'requests.snackbar.evidenceMissing'
      );
      this.util.customSnackBar(message, ACTION_TYPE.FAILED);
    }
  }

  // view uploaded file
  viewFiles(field: any): void {
    window.open(field.file, '_blank');
  }

  // remove uploaded file
  removeClaimFile(field: any): void {
    const index = this.fileList.map((e: any) => e.field).indexOf(field.id);
    this.fileList.splice(index, 1);
    field.file = false;
    delete field.value;
  }

  // set claim evidence fields(for files)
  claimsFile(file: any, item: any): void {
    item.file = true;
    item.value = file;
    const node_id = localStorage.getItem('companyID');
    const params = {
      field: item.id,
      file: file.target.files[0],
      node: node_id,
      changed: true,
    };
    this.fileList.push(params);
  }

  // check if all claim evidences are present
  checkCompleted(item: any): void {
    const claim = this.requestDetails;
    this.requestDetails.fields.filter((e: any) => {
      if (e.id === item.id) {
        e.changed = true;
      }
    });
    let values = [];
    values = [];
    claim.fields.map((field: any) => {
      if (field.type === 3) {
        if (field.file) {
          values.push(true);
        }
      }
      if (field.type === 2) {
        if (field.response) {
          values.push(true);
        }
      }
      if (field.type === 1) {
        if (field.response) {
          values.push(true);
        }
      }
    });
    if (claim.fields.length === values.length) {
      claim.completed = true;
    } else {
      claim.completed = false;
    }
  }

  // attach / update evidence pop up
  verifyAttachRequest(): void {
    if (this.requestDetails.claim_attached) {
      // const dialogRef = this.dialog.open(UpdateEvidenceComponent, {
      //   disableClose: true,
      //   width: '50vw',
      //   height: 'auto',
      // });
      // dialogRef.afterClosed().subscribe(result => {
      //   // this.companyData = result;
      //   if (result) {
      //     this.attachEvidence();
      //   }
      // });
    } else {
      this.attachEvidence();
    }
  }

  changeTab(item: ICommonObj): void {
    const val = item.id === 'incoming' ? 1 : 2;
    this.activeTab = item.id;
    this.dataLoaded = false;
    this.appliedFilterValues = {
      searchText: '',
      status: '',
      requestType: '',
      direction: val,
    };
    this.getRequests();
  }

  searchFilter(data: any): void {
    this.dataLoaded = false;
    this.appliedFilterValues.searchText = data;
    this.getRequests();
  }

  filterItems(data: any, type: string): void {
    this.dataLoaded = false;
    const selected = data.id === 'All' ? '' : data.id;
    this.appliedFilterValues[type] = selected;
    this.getRequests();
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
