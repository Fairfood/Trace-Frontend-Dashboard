import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FfImageSliderComponent } from './ff-image-slider.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SimpleChange } from '@angular/core';

describe('FfImageSliderComponent', () => {
  let fixture: ComponentFixture<FfImageSliderComponent>;
  let component: FfImageSliderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        FfImageSliderComponent,
      ],
    });

    fixture = TestBed.createComponent(FfImageSliderComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle ngOnChanges', () => {
    const imageArray = [
      {
        imageUrl: 'image1.jpg',
        title: 'Image 1',
        subTitle: 'Subtitle 1',
      },
      {
        imageUrl: 'image2.jpg',
        title: 'Image 2',
        subTitle: 'Subtitle 2',
      },
      {
        imageUrl: 'image3.jpg',
        title: 'Image 3',
        subTitle: 'Subtitle 3',
      },
    ];
    const change = new SimpleChange(null, imageArray, true);
    component.ngOnChanges({ imageArray: change });

    expect(component.active).toBe(0);
    expect(component.activeLeft).toBe(2);
    expect(component.activeRight).toBe(1);
  });

  it('should changeImage when imageArray has only two items', () => {
    component.imageArray = [
      {
        imageUrl: 'image1.jpg',
        title: 'Image 1',
        subTitle: 'Subtitle 1',
      },
      {
        imageUrl: 'image2.jpg',
        title: 'Image 2',
        subTitle: 'Subtitle 2',
      },
    ];
    component.active = 0;

    component.changeImage('next');

    expect(component.active).toBe(1);
  });
});
