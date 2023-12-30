/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
// components
import { LoaderComponent } from 'fairfood-utils';

/**
 * Component for connection mapping.
 */
@Component({
  selector: 'app-connection-mapping',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './connection-mapping.component.html',
  styleUrls: ['./connection-mapping.component.scss'],
})
export class ConnectionMappingComponent {
  /** Input for supply selection. */
  @Input() supplySelection: any;

  /** Input for supply selection count. */
  @Input() supplySelectionCount: number;

  /** Input for additional loader. */
  @Input() additionalLoader: boolean;

  /** Input for select all. */
  @Input() selectAll: boolean;

  /** Output for load more data event. */
  @Output() loadMoreData = new EventEmitter();

  /** Output for update radio event. */
  @Output() updateRadio = new EventEmitter();

  /**
   * Tracks items by their ID.
   * @param index - The index.
   * @param item - The item.
   * @returns The item's ID.
   */
  trackByFn(index: number, item: any): any {
    return item.id;
  }

  /**
   * Updates tagging for an item.
   * @param item - The item to update.
   */
  updateTagging(item: any): void {
    item.selected = !item.selected;
  }

  /** Loads more data. */
  loadMore(): void {
    this.loadMoreData.emit();
  }

  /** Handles the change of the model. */
  modelChange(): void {
    this.selectAll = !this.selectAll;
    this.updateRadio.emit(this.selectAll);
  }
}
