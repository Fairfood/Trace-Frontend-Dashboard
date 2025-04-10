/* istanbul ignore file */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { stockRoutes } from './stock.routes';

import { MatIconModule } from '@angular/material/icon';

import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { StockComponent } from './stock.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonsComponent } from 'fairfood-utils';

@NgModule({
  declarations: [StockComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(stockRoutes),
    MatIconModule,
    ExportIconComponent,
    TranslateModule,
    ButtonsComponent,
  ],
})
export class StockModule {}
