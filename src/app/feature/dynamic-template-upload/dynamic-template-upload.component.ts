import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
// services
import { RouterService, UtilService } from 'src/app/shared/service';
import { DynamicTemplateStore } from './dynamic-template-upload-store.service';
import { DynamicTemplateUploadService } from './dynamic-template-upload.service';
// configs
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { MatDialog } from '@angular/material/dialog';
import { LoseDataDialogComponent } from './lose-data-dialog';

const BLOCK_NAVIGATION = ['linkFields', 'verification', 'summary'];

@Component({
  selector: 'app-dynamic-template-upload',
  templateUrl: './dynamic-template-upload.component.html',
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
    private service: DynamicTemplateUploadService,
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
      this.util.customSnackBar('Invalid URL', ACTION_TYPE.FAILED);
      this.canLoad = false;
      this.routeService.navigateUrl('/dashboard');
    }
  }

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
