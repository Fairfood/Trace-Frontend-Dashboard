import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { layout } from './layout.routes';
import { MatIconModule } from '@angular/material/icon';

// components
import { LayoutComponent } from './layout.component';
// standalone components
import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';
import { LoaderComponent } from 'fairfood-utils';
@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(layout),
    MatIconModule,
    HeaderComponent,
    SidebarComponent,
    LoaderComponent,
  ],
})
export class LayoutModule {}
