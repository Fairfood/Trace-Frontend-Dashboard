import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockButtonState } from '../process-stock.config';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-stock-action-button',
  templateUrl: './stock-action-button.component.html',
  styleUrls: ['./stock-action-button.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonsComponent],
})
export class StockActionButtonComponent {
  // properties related to next or primary button
  @Input() buttonNextState: StockButtonState;

  @Output() buttonsClicked = new EventEmitter();

  buttonNavigation(type: string): void {
    this.buttonsClicked.next(type);
  }
}
