/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// config
import {
  IFarmerDetails,
  IReference,
  PROFILE_TABS,
} from './farmer-profile.config';
// service(s) and component(s)
import { FarmerProfileStoreService } from './farmer-profile-store.service';
import { AddReferenceComponent } from './add-reference/add-reference.component';
import { ICommonObj, IListWithIndex } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-farmer-profile',
  templateUrl: './farmer-profile.component.html',
  styleUrls: ['./farmer-profile.component.scss'],
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
    private store: FarmerProfileStoreService,
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
          this.profileData = res;
          this.loading = false;
          this.editingDataInit();
          this.farmerReferencesInit();
          this.store.fetchReferences();
          this.store.fetchFarmerReferences(id);
          this.store.fetchFarmerPlots(id);
          this.store.farmerActivities(id);
          this.store.getFarmerPayments(id);
          this.store.fetchFarmerAttachments(id);
        } else {
          this.loading = true;
        }
      },
    });
    this.pageApis.push(sub);
  }

  farmerReferencesInit(): void {
    if (!this.farmerRef) {
      this.farmerRef = this.store.farmerReference$.subscribe({
        next: (res: IReference) => {
          this.references = res;
          this.activeFarmerRef = 0;
          this.activeFarmerDetails = this.references.results[0];
          this.farmerReferences = res.results?.map(item => {
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
        },
      });
      this.pageApis.push(this.loaderSub);
    }
  }

  referenceItemClicked({ index }: IListWithIndex): void {
    this.activeFarmerRef = index;
    this.activeFarmerDetails = this.references.results[index];
  }

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
        this.store.updateReference({ count: 0, results: [], loading: true });
        this.store.fetchFarmerReferences(this.profileData.id);
      }
    });
  }

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

  ngOnDestroy(): void {
    this.store.updateFarmerDetails(null);
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
