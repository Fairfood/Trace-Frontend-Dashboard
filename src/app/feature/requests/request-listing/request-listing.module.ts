import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
// standalone components
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';

import { RequestListingComponent } from './request-listing.component';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { RequestAvatarPipe } from './request-listing.pipe';
import { CreateRequestComponent } from '../create-request';
import { RequestResponseComponent } from '../request-response';
import { DeclineRequestComponent } from '../decline-request';
import { RemovetransparencyRequestComponent } from '../remove-transparency-request';
import { RequestForInfoComponent } from '../request-for-info';
// routes
const routes: Routes = [{ path: '', component: RequestListingComponent }];
@NgModule({
  declarations: [RequestListingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule.forChild(),
    LoaderComponent,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
    ButtonsComponent,
    FairFoodCustomTabComponent,
    SearchBoxComponent,
    FfFilterBoxWrapperComponent,
    RequestAvatarPipe,
    CreateRequestComponent,
    RequestResponseComponent,
    DeclineRequestComponent,
    RemovetransparencyRequestComponent,
    RequestForInfoComponent,
  ],
})
export class RequestsModule {}
