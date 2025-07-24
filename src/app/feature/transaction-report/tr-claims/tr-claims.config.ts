import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ClaimDetailComponent } from '../../claim/claim-detail';
import { LoaderComponent } from 'fairfood-utils';
import { TranslateModule } from '@ngx-translate/core';

export const CL_IMPORTS = [
  CommonModule,
  ClaimDetailComponent,
  MatIconModule,
  LoaderComponent,
  TranslateModule,
];
