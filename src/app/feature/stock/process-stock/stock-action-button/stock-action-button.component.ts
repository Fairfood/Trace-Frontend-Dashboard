import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StockButtonState } from '../process-stock.config';

@Component({
  selector: 'app-stock-action-button',
  templateUrl: './stock-action-button.component.html',
  styleUrls: ['./stock-action-button.component.scss'],
})
export class StockActionButtonComponent {
  // properties related to next or primary button
  @Input() buttonNextState: StockButtonState;

  @Output() buttonsClicked = new EventEmitter();

  buttonNavigation(type: string): void {
    this.buttonsClicked.next(type);
  }
}
