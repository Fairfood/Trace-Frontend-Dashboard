/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, map, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
// services
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
// components
import { FfColumnMappingBoxComponent } from '../ff-column-mapping-box';
import { MapColumnNamePipe } from './mappint-table.pipe';

@Component({
  selector: 'app-mapping-table',
  standalone: true,
  imports: [CommonModule, FfColumnMappingBoxComponent, MapColumnNamePipe],
  templateUrl: './mapping-table.component.html',
  styleUrls: ['./mapping-table.component.scss'],
})
export class MappingTableComponent implements OnInit, OnDestroy {
  @Input() titleRow: number;
  pageApis: Subscription[] = [];

  dropdownMasterData$: Observable<any>;
  tableData$: Observable<any>;
  displayedColumns: string[] = [];
  dataRows: any[] = [];
  allData: any[] = [];
  schemaData: any[] = [];
  constructor(
    private store: DynamicTemplateStore,
    private service: DynamicTemplateUploadService
  ) {}

  ngOnInit(): void {
    this.updateTableData();
    /**
     * Passing to child component to display as a dropdown
     * schemaData: is the master data
     */
    this.dropdownMasterData$ = this.store.schemaArray$.pipe(
      tap((res: any) => (this.schemaData = res)),
      map((res: any) => {
        return res
          ?.filter((s: any) => !s.selected)
          .map((item: any) => {
            const { id, label, required } = item;
            return { id, name: `${label}${required ? '*' : ''}` };
          });
      })
    );
  }

  /**
   * Fetching the templatePreview data from store
   */
  updateTableData(): void {
    const sub = this.store.templatePreview$.subscribe({
      next: (res: any) => {
        if (res) {
          this.allData = res;
          // once it is received init other subs
          this.initSub();
        }
      },
    });
    this.pageApis.push(sub);
  }

  /**
   * Used to capture the row field updation
   * eg: title row and data row
   */
  initSub(): void {
    const api = this.service.updateRowIndex$.subscribe({
      next: (res: any) => {
        if (res) {
          const { title } = res;
          this.setTableData(title - 1);
        }
      },
    });
    this.pageApis.push(api);
  }

  setTableData(titleRow: number): void {
    this.displayedColumns = this.allData[titleRow];
    this.dataRows = this.allData.slice(titleRow + 1);
  }

  /**
   * It returns an index
   * whether the column index already mapped or not
   * @param columnIndex number
   * @returns number
   */
  checkIfMapped(columnIndex: number): number {
    const index = this.schemaData.findIndex(
      (el: any) => el.columnIndex === columnIndex
    );
    return index;
  }

  /**
   * Index: used to identify the column position
   * If the column is already mapped to some value
   * then it is unselected and its column index is reset
   *
   * then modifying the schema array
   * @param item any
   * @param index number
   */
  mapFields(item: any, index: number): void {
    const data = [...this.schemaData];
    const isMapped = this.checkIfMapped(index);
    if (isMapped > -1) {
      data[isMapped].selected = false;
      data[isMapped].columnIndex = -1;
      this.updateSchemaValue(data, item.id, index);
    } else {
      this.updateSchemaValue(data, item.id, index);
    }
  }

  /**
   * data is all the schema array
   * correspoding schema field
   * @param data any[]
   * @param id string
   * @param updateIndex number
   */
  updateSchemaValue(data: any[], id: string, updateIndex: number): void {
    const found = data.findIndex((el: any) => el.id === id);
    data[found].selected = true;
    data[found].columnIndex = updateIndex;
    data[found].columnName = this.displayedColumns[updateIndex];
    this.store.updateStateProp<any>('schemaFields', data);
  }

  /**
   * If the dropdown is cleared, then the mapped column should be cleared as well
   * And the whole array is updated
   * @param clear boolean
   * @param j number
   */
  clearDropdown(clear: boolean, j: number): void {
    if (clear) {
      const data = [...this.schemaData];
      const isMapped = this.checkIfMapped(j);
      if (isMapped > -1) {
        data[isMapped].selected = false;
        data[isMapped].columnIndex = -1;
        this.store.updateStateProp<any>('schemaFields', data);
      }
    }
  }

  trackByFn(index: number): any {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
