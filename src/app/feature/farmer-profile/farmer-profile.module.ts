import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

// material
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
// components
import { FarmerProfileComponent } from './farmer-profile.component';
import { FarmerDetailsComponent } from './farmer-details/farmer-details.component';
import { FarmComponent } from './farm/farm.component';
import { IncomeComponent } from './income/income.component';
import { ClaimsComponent } from './claims/claims.component';
import { DocsComponent } from './docs/docs.component';
import { AddReferenceComponent } from './add-reference/add-reference.component';
import { NewPlotComponent } from './new-plot/new-plot.component';
import { FarmerActivitiesComponent } from './farmer-activities/farmer-activities.component';
// modules
import { AttachementsTableModule } from '../attachments-table/attachments-table.module';
import { ProfileAvatarModule } from '../profile-avatar/profile-avatar.module';
// standalone components
import {
  LoaderComponent,
  ActionButtonsComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';

import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { ListDetailComponent } from './list-detail/list-detail.component';
import { TransformDropdownOptions } from './farmer-details/farmer-details.pipe';

const routes: Routes = [
  {
    path: '',
    component: FarmerProfileComponent,
  },
];

@NgModule({
  declarations: [
    FarmerProfileComponent,
    FarmerDetailsComponent,
    FarmComponent,
    IncomeComponent,
    ClaimsComponent,
    DocsComponent,
    AddReferenceComponent,
    NewPlotComponent,
    FarmerActivitiesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatDialogModule,
    GoogleMapsModule,
    AttachementsTableModule,
    LoaderComponent,
    FairFoodInputComponent,
    FfDropdownComponent,
    FairFoodCustomTabComponent,
    ButtonsComponent,
    FfPaginationComponent,
    ActionButtonsComponent,
    SearchBoxComponent,
    ExportIconComponent,
    ListDetailComponent,
    ProfileAvatarModule,
    TransformDropdownOptions,
  ],
})
export class FarmerProfileModule {}
