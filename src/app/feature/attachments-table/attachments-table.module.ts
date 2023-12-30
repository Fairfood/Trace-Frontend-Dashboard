import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// material
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
const MATERIAL = [MatDialogModule, MatIconModule];
// module components
import { AttachementsTableComponent } from './attachments-table.component';
import { UploadDocumentComponent } from './upload-document';

// external library
import { FairFoodInputComponent } from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
const STAND_ALONE = [
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
  FairFoodInputComponent,
];
@NgModule({
  declarations: [AttachementsTableComponent, UploadDocumentComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ...MATERIAL,
    ...STAND_ALONE,
  ],
  exports: [AttachementsTableComponent, UploadDocumentComponent],
})
export class AttachementsTableModule {}
