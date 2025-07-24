import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
// services
import { RouterService, UtilService } from 'src/app/shared/service';
import { DynamicTemplateStore } from './dynamic-template-upload-store.service';
// configs
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ITabItem } from 'src/app/shared/configs/app.model';
// components
import { LoseDataDialogComponent } from './lose-data-dialog';
import { UploadSummaryComponent } from './upload-summary';
import { TemplateMappingComponent } from './template-mapping';
import { TemplateSelectionComponent } from './template-selection';
import { TemplateVerificationComponent } from './template-verification';
import { FairFoodCustomTabComponent } from 'fairfood-utils';

const BLOCK_NAVIGATION = ['linkFields', 'verification', 'summary'];

@Component({
  selector: 'app-dynamic-template-upload',
  templateUrl: './dynamic-template-upload.component.html',
  standalone: true,
  imports: [
    CommonModule,
    UploadSummaryComponent,
    TemplateMappingComponent,
    TemplateSelectionComponent,
    TemplateVerificationComponent,
    FairFoodCustomTabComponent,
    MatDialogModule,
    LoseDataDialogComponent,
  ],
})
export class DynamicTemplateUploadComponent implements OnDestroy {
  type: number;
  canLoad: boolean;
  currentStep$ = this.store.currentStep$;
  tabGroup: Observable<ITabItem[]> = this.store.tabChanges$;
  currentStep: Observable<string> = this.store.currentStep$;

  constructor(
    private store: DynamicTemplateStore,
    private route: ActivatedRoute,
    private util: UtilService,
    private routeService: RouterService,
    public dialog: MatDialog
  ) {
    const found = ['transactions', 'connections'].includes(
      this.route.snapshot.params.id
    );
    if (found) {
      this.canLoad = true;
      this.type = this.route.snapshot.params.id === 'transactions' ? 1 : 2;
      this.store.updateStateProp<number>('templateType', this.type);
    } else {
      /* istanbul ignore next */
      this.util.customSnackBar('Invalid URL', ACTION_TYPE.FAILED);
      this.canLoad = false;
      this.routeService.navigateUrl('/dashboard');
    }
  }

  /* istanbul ignore next */
  errorMessage(): void {
    const dialogRef = this.dialog.open(LoseDataDialogComponent, {
      disableClose: true,
      width: '600px',
      height: 'auto',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Yes') {
        this.store.removeNewUplod();
      }
    });
  }

  changeTab(item: ITabItem): void {
    if (
      BLOCK_NAVIGATION.includes(this.store.getCurrentStep()) &&
      item.id === 'upload'
    ) {
      this.errorMessage();
    } else if (
      ['verification', 'summary'].includes(this.store.getCurrentStep()) &&
      item.id === 'linkFields'
    ) {
      this.store.goToLinkFields();
    } else {
      this.store.updateStateProp<string>('currentStep', item.id);
    }
  }

  ngOnDestroy(): void {
    this.store.resetState();
  }
}
