import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// material
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
// components
import { DocUploadComponent } from './doc-upload/doc-upload.component';
import { DocumentsTabComponent } from './documents-tab/documents-tab.component';
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';
// external library
import { FairFoodInputComponent } from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
} from 'fairfood-utils';

const components = [DocUploadComponent, DocumentsTabComponent];
@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ButtonsComponent,
    FairFoodInputComponent,
    FormsModule,
    ReactiveFormsModule,
    ProfilePopupComponent,
    LoaderComponent,
    FfPaginationComponent,
    MatMenuModule,
  ],
  exports: [...components],
})
export class DocumentationModule {}
