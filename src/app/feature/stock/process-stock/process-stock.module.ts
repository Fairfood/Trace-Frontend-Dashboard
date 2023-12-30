import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// components
import { ProcessStockComponent } from './process-stock.component';
import { TransactionSummaryComponent } from './transaction-summary';
import { StockClaimsComponent } from './stock-claims';
import { SummaryCardComponent } from './summary-card';
import { RemoveDialogComponent } from './remove-dialog';
import { StockActionButtonComponent } from './stock-action-button';
import { ReceiveStockSingleComponent } from './receive-stock-single';
import { StockSendComponent } from './stock-send';
import { StockConvertComponent } from './stock-convert';
import { StockMergeComponent } from './stock-merge';
// material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
// standalone components
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import { ClaimDetailComponent } from '../../claim/claim-detail';
import { CreateRequestComponent } from '../../requests/create-request';
import { CreateConnectionPopupComponent } from '../../connections/create-connection-popup';

// routes
const routes: Routes = [{ path: '', component: ProcessStockComponent }];

// date format change
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    ProcessStockComponent,
    StockSendComponent,
    StockConvertComponent,
    TransactionSummaryComponent,
    StockClaimsComponent,
    SummaryCardComponent,
    RemoveDialogComponent,
    StockActionButtonComponent,
    StockMergeComponent,
    ReceiveStockSingleComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    MatAutocompleteModule,
    MatMenuModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatCheckboxModule,
    FairFoodCustomTabComponent,
    LoaderComponent,
    SearchBoxComponent,
    FfDropdownComponent,
    ButtonsComponent,
    FairFoodInputComponent,
    ButtonsComponent,
    ClaimDetailComponent,
    CreateConnectionPopupComponent,
    CreateRequestComponent,
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
  ],
})
export class ProcessStockModule {}
