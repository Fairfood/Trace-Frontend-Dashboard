/* istanbul ignore file */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
const ANGULAR = [CommonModule, FormsModule, ReactiveFormsModule];
// material
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
const MATERIAL = [
  MatIconModule,
  MatTableModule,
  MatDialogModule,
  MatTooltipModule,
];
import { TransactionReportComponent } from './transaction-report.component';
import { TraceModule } from '../trace/trace.module';

// standalone components
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';

import { TransactionActionsComponent } from '../transaction-actions';
import { BatchInfoComponent } from './batch-info';
import { QrCodeGeneratorComponent } from './qr-code-generator';
import { BasicDetailsComponent } from './basic-details';
import { BatchListComponent } from './batch-list/batch-list.component';
import { TrClaimsComponent } from './tr-claims/tr-claims.component';
import { ReceiptComponent } from './receipt';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';

const COMPONENTS = [
  LoaderComponent,
  FairFoodCustomTabComponent,
  ButtonsComponent,
  FfPaginationComponent,
  CommonWalletComponent,
  FairFoodInputComponent,
  TransactionActionsComponent,
  BatchInfoComponent,
  QrCodeGeneratorComponent,
  BasicDetailsComponent,
  BatchListComponent,
  TrClaimsComponent,
  ReceiptComponent,
];

const trRoutes: Routes = [
  {
    path: '',
    component: TransactionReportComponent,
  },
];

@NgModule({
  declarations: [TransactionReportComponent],
  imports: [
    ...ANGULAR,
    ...MATERIAL,
    ...COMPONENTS,
    RouterModule.forChild(trRoutes),
    TraceModule,
  ],
})
export class TransactionReportModule {}
