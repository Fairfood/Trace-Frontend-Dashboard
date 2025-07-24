/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// config
import {
  FARMER_PROFILE_IMPORTS,
  IClaim,
  IFarmerDetails,
  IReference,
  PROFILE_TABS,
} from './farmer-profile.config';
// service(s) and component(s)
import { FarmerProfileStoreService } from './';
import { AddReferenceComponent } from './add-reference';
import { ICommonObj, IListWithIndex } from 'src/app/shared/configs/app.model';
import { UpdateClaimComponent } from './update-claim/update-claim.component';

@Component({
  selector: 'app-farmer-profile',
  templateUrl: './farmer-profile.component.html',
  styleUrls: ['./farmer-profile.component.scss'],
  standalone: true,
  imports: FARMER_PROFILE_IMPORTS,
})
export class FarmerProfileComponent implements OnInit, OnDestroy {
  tabItems: ICommonObj[] = PROFILE_TABS;
  activeTabId: string;
  pageApis: Subscription[] = [];
  profileData: IFarmerDetails;
  loading = true;
  farmerRef: Subscription;
  loaderSub: Subscription;
  loaderText: string;
  editingDetails: boolean;
  references: IReference;
  farmerReferences: any;
  activeFarmerRef: number;
  activeFarmerDetails: any;

  constructor(
    private route: ActivatedRoute,
    public store: FarmerProfileStoreService,
    public dialog: MatDialog
  ) {
    this.activeTabId = PROFILE_TABS[0].id;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    this.store.getFarmerDetails(id);
    const sub = this.store.farmerDetails$.subscribe({
      next: (res: IFarmerDetails) => {
        if (res) {
          const { otherApiCall } = res;

          this.profileData = res;
          console.log(this.profileData, 'profileData');

          this.loading = false;

          if (otherApiCall) {
            this.editingDataInit();
            this.farmerReferencesInit();
            this.store.fetchReferences();
            this.store.fetchFarmerReferences(id);
            this.store.fetchFarmerPlots(id);
            this.store.farmerActivities(id);
            this.store.getFarmerPayments(id);
            this.store.fetchFarmerAttachments(id);
          }
        } else {
          this.loading = true;
        }
      },
    });
    this.pageApis.push(sub);
  }

  /* istanbul ignore next */
  farmerReferencesInit(): void {
    if (!this.farmerRef) {
      this.farmerRef = this.store.farmerReference$.subscribe({
        next: (res: IReference) => {
          this.references = res;
          this.activeFarmerRef = 0;
          const { results } = res;
          if (results.length) {
            this.activeFarmerDetails = results[0];
            this.farmerReferences = results?.map(item => {
              const {
                reference_details: { description, name, image },
              } = item;
              return {
                title: name,
                description,
                leftIcon: {
                  isMatIcon: image ? false : true,
                  icon: image || 'verified_user',
                },
                rightIcon: {
                  isMatIcon: true,
                  icon: 'keyboard_arrow_right',
                },
              };
            });
          } else {
            this.farmerReferences = [];
            this.activeFarmerDetails = null;
          }
        },
      });
      this.pageApis.push(this.loaderSub);
    }
  }

  referenceItemClicked({ index }: IListWithIndex): void {
    this.activeFarmerRef = index;
    this.activeFarmerDetails = this.references.results[index];
  }

  /* istanbul ignore next */
  addReference(editData?: any, isEdit?: boolean): void {
    let data: any;

    if (isEdit) {
      data = {
        farmerId: this.profileData.id,
        ...editData,
        isEdit,
      };
    } else {
      data = {
        farmerId: this.profileData.id,
      };
    }
    const dialogRef = this.dialog.open(AddReferenceComponent, {
      disableClose: true,
      width: '660px',
      height: '350px',
      panelClass: 'custom-modalbox',
      data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateStateProp<IReference>('farmerReferences', {
          count: 0,
          results: [],
          loading: true,
        });
        this.store.fetchFarmerReferences(this.profileData.id);
      }
    });
  }

  /* istanbul ignore next */
  editingDataInit(): void {
    if (!this.loaderSub) {
      this.loaderSub = this.store.updatingDetails$.subscribe({
        next: (updating: boolean) => {
          this.loading = updating;
        },
      });
      this.pageApis.push(this.loaderSub);
    }
  }

  changeTab(item: ICommonObj): void {
    const { id } = item;
    if (this.activeTabId !== id) {
      this.activeTabId = id;
    }
  }

  detailsEditing(data: boolean): void {
    this.editingDetails = data;
  }

  openDialog(claim: IClaim): void {
    const dialog = this.dialog.open(UpdateClaimComponent, {
      width: '55vw',
      panelClass: 'custom-modalbox',
      autoFocus: false,
      data: claim,
    });
  }

  onClaimsReloaded(): void {
    this.activeTabId = 'claims';
    const id = this.route.snapshot.params.id;
    this.store.getFarmerDetails(id);
  }

  gotoClaimTab(): void {
    this.activeTabId = 'claims';
  }

  ngOnDestroy(): void {
    this.store.updateStateProp<any>('farmerDetails', null);
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
