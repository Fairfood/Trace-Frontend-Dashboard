/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICarousal } from '../../configs/app.model';

@Component({
  selector: 'app-ff-image-slider',
  templateUrl: './ff-image-slider.component.html',
  styleUrls: ['./ff-image-slider.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
})
export class FfImageSliderComponent implements OnChanges {
  @Input() imageArray: ICarousal[];

  @Output() currentActiveIndex = new EventEmitter();

  active: any;
  activeRight: any;
  activeLeft: any;

  ngOnChanges(changes: SimpleChanges): void {
    const imageArray = changes['imageArray'].currentValue;
    this.active = 0;
    if (imageArray.length > 2) {
      this.activeLeft = imageArray.length - 1;
      this.activeRight = 1;
    } else if (imageArray.length === 2) {
      this.activeRight = 1;
      this.activeLeft = -1;
    } else if (imageArray.length === 1) {
      this.activeRight = -1;
      this.activeLeft = -1;
    }
  }

  changeImage(direction: string): void {
    // if image array has only two then switching indexes 0 and 1
    if (this.imageArray.length === 2) {
      this.active = +!this.active;
      this.activeRight = +!this.activeRight;
      this.currentActiveIndex.emit(this.active);
    } else if (this.imageArray.length > 2) {
      // when clicking next increase index
      if (direction === 'next') {
        this.active = this.incrementIndex(this.active);
        this.activeLeft = this.incrementIndex(this.activeLeft);
        this.activeRight = this.incrementIndex(this.activeRight);
      } else {
        this.active = this.decrementIndex(this.active);
        this.activeLeft = this.decrementIndex(this.activeLeft);
        this.activeRight = this.decrementIndex(this.activeRight);
      }
      this.currentActiveIndex.emit(this.active);
    } else {
      console.log('No action');
    }
  }

  /* istanbul ignore next */
  decrementIndex(label: number): number {
    if (label === 0) {
      return this.imageArray.length - 1;
    } else {
      return label - 1;
    }
  }

  /* istanbul ignore next */
  incrementIndex(label: number): number {
    if (label === this.imageArray.length - 1) {
      return 0;
    } else {
      return label + 1;
    }
  }
}
