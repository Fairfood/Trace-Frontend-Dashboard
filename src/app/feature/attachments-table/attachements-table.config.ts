import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FairFoodInputComponent } from 'fairfood-form-components';
import {
  ButtonsComponent,
  FfPaginationComponent,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { UploadDocumentComponent } from 'src/app/shared/components/upload-document';

const STAND_ALONE = [
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
  FairFoodInputComponent,
  UploadDocumentComponent,
  FfCustomPaginationComponent,
];

export const COMP_IMPORTS = [
  NgIf,
  NgFor,
  NgTemplateOutlet,
  DatePipe,
  ReactiveFormsModule,
  MatDialogModule,
  ...STAND_ALONE,
  TranslateModule,
];
