import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShrinkPipe } from './wizard-step.pipe';
import { IWizardStep } from '../../configs/app.model';

@Component({
  selector: 'app-wizard-step',
  templateUrl: './wizard-step.component.html',
  styleUrls: ['./wizard-step.component.scss'],
  standalone: true,
  imports: [CommonModule, ShrinkPipe],
})
export class WizardStepComponent {
  @Input() activeIndex: number;
  @Input() list: IWizardStep[];
  @Input() hideBadge?: boolean;
  @Output() itemClicked = new EventEmitter();

  /* istanbul ignore next */
  stepClicked(index: number): void {
    this.itemClicked.emit(index);
  }
}
