import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
// components
import { TraceComponent } from './trace.component';
import { TrActorsComponent } from './tr-actors';
import { TrMapviewComponent } from './tr-mapview';
import { TrTransactionsComponent } from './tr-transactions';
// material
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// stand alone components
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
import {
  FfFilterBoxWrapperComponent,
  FfFilterBoxComponent,
} from 'fairfood-form-components';

import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';
import { WizardStepComponent } from 'src/app/shared/components/wizard-step';
import { FfImageSliderComponent } from 'src/app/shared/components/ff-image-slider';

@NgModule({
  declarations: [
    TraceComponent,
    TrTransactionsComponent,
    TrActorsComponent,
    TrMapviewComponent,
  ],
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatCardModule,
    FfPaginationComponent,
    FairFoodCustomTabComponent,
    LoaderComponent,
    ButtonsComponent,
    SearchBoxComponent,
    ExportIconComponent,
    FfFilterBoxWrapperComponent,
    CommonWalletComponent,
    WizardStepComponent,
    FfImageSliderComponent,
    FfFilterBoxComponent,
  ],
  exports: [TraceComponent],
})
export class TraceModule {}
