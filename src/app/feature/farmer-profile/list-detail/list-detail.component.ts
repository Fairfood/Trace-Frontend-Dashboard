import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IList } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ListDetailComponent {
  @Input() iterationList: IList[];
  @Input() activeItem?: number;
  @Input() showAddButton?: boolean;
  @Input() addButtonText?: string;

  @Output() listClicked = new EventEmitter();
  @Output() buttonPressed = new EventEmitter();

  itemClicked(item: IList, index: number): void {
    this.listClicked.emit({ item, index });
  }

  buttonClicked(): void {
    this.buttonPressed.emit(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trackFn(index: number): any {
    return index;
  }
}
