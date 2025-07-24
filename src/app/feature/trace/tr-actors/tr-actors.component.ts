/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

// material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
// service
import { TraceStoreService } from '../trace-store.service';
// components
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import {
  FfPaginationComponent,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tr-actors',
  templateUrl: './tr-actors.component.html',
  styleUrls: ['./tr-actors.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    MatTableModule,
    SearchBoxComponent,
    FfFilterBoxWrapperComponent,
    LoaderComponent,
    FfPaginationComponent,
    TranslateModule,
    FfCustomPaginationComponent,
  ],
})
export class TrActorsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'location', 'type', 'product'];
  tableLoading = true;
  tableCount: number;
  actorData$: Observable<any[]> = this.store.actorsData$;
  dataSource: MatTableDataSource<any>;
  productData$: Observable<any[]> = this.store.productData$;
  sub: Subscription;
  selectedProduct = '';

  constructor(private store: TraceStoreService) {
    this.tableCount = 0;
  }

  ngOnInit(): void {
    this.sub = this.store.actorsData$.subscribe({
      next: (actors: any[]) => {
        this.dataSource = new MatTableDataSource(actors);
        this.tableCount = actors.length;
        this.tableLoading = false;
      },
    });
  }

  // material table filter
  filterData(newValue: any): void {
    const selectedFilterValue = newValue.id === 'All' ? '' : newValue.name;
    this.selectedProduct = selectedFilterValue;
    this.dataSource.filter = selectedFilterValue;
  }

  // material table search
  searchFilter(data: string): void {
    this.dataSource.filter = data;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  pageEventChanged(e: any): void {
    const { limit, offset } = e;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
