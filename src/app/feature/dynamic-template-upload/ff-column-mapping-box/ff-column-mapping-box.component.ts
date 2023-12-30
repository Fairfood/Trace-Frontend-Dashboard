/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { FfDropdownSelectComponent } from 'fairfood-form-components';
/**
 * Similar component to a drowdown select
 */
@Component({
  selector: 'app-ff-column-mapping-box',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    FfDropdownSelectComponent,
  ],
  templateUrl: './ff-column-mapping-box.component.html',
  styleUrls: ['./ff-column-mapping-box.component.scss'],
})
export class FfColumnMappingBoxComponent implements OnChanges {
  @ViewChild('dropdownMenuTrigger') dropdownMenuTrigger: MatMenuTrigger;

  @Input() dropdownMasterData: any;
  @Input() defaultValue: string;

  @Output() clearSelection = new EventEmitter();
  @Output() itemSelected = new EventEmitter();

  boxState: 'default' | 'selected' = 'default';
  value: any;

  ngOnChanges(changes: SimpleChanges): void {
    const { defaultValue } = changes;
    if (defaultValue?.currentValue) {
      this.value = defaultValue.currentValue;
      this.boxState = 'selected';
    }
  }

  itemClicked(data: any): void {
    this.clearSelection.emit(data);
    this.boxState = 'default';
    this.closeMenu();
  }

  selectedItem(data: any): void {
    this.itemSelected.emit(data);
    this.boxState = 'selected';
    this.closeMenu();
  }

  closeMenu(): void {
    this.dropdownMenuTrigger.closeMenu();
  }
}
