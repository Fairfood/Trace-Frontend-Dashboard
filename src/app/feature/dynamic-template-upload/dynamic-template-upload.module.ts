import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { DynamicTemplateUploadComponent } from './';
// components used in the module
import { TemplateVerificationComponent } from './template-verification';
import { TemplateSelectionComponent } from './template-selection';
import { TemplateMappingComponent } from './template-mapping';
import { UploadSummaryComponent } from './upload-summary';
import { FairFoodCustomTabComponent } from 'fairfood-utils';
import { LoseDataDialogComponent } from './lose-data-dialog';

const templateRoute: Routes = [
  {
    path: '',
    component: DynamicTemplateUploadComponent,
  },
];
@NgModule({
  declarations: [DynamicTemplateUploadComponent],
  imports: [
    RouterModule.forChild(templateRoute),
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
export class DynamicTemplateUploadModule {}
