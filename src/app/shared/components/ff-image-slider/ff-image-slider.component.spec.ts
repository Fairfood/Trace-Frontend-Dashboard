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

  it('imageArray has three items', () => {
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
    expect(component.activeLeft).toBe(imageArray.length - 1);
    expect(component.activeRight).toBe(1);
  });

  it('imageArray has only two', () => {
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
    ];
    const change = new SimpleChange(null, imageArray, true);
    component.ngOnChanges({ imageArray: change });

    expect(component.active).toBe(0);
    expect(component.activeLeft).toBe(-1);
    expect(component.activeRight).toBe(1);
  });

  it('should changeImage when imageArray has only two items', () => {
    const imageArray = [
      {
        imageUrl: 'image1.jpg',
        title: 'Image 1',
        subTitle: 'Subtitle 1',
      },
    ];
    const change = new SimpleChange(null, imageArray, true);
    component.ngOnChanges({ imageArray: change });

    expect(component.active).toBe(0);
    expect(component.activeLeft).toBe(-1);
    expect(component.activeRight).toBe(-1);
  });

  it('should emit currentActiveIndex when imageArray has only two elements and direction is next', () => {
    spyOn(component.currentActiveIndex, 'emit');

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
    component.ngOnChanges({
      imageArray: new SimpleChange(null, component.imageArray, true),
    });
    component.changeImage('next');

    expect(component.active).toEqual(1);
    expect(component.activeRight).toEqual(0);
    expect(component.currentActiveIndex.emit).toHaveBeenCalledWith(1);
  });

  it('should emit currentActiveIndex when imageArray has more than two elements and direction is next', () => {
    spyOn(component.currentActiveIndex, 'emit');

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
      {
        imageUrl: 'image3.jpg',
        title: 'Image 3',
        subTitle: 'Subtitle 223',
      },
    ];
    component.ngOnChanges({
      imageArray: new SimpleChange(null, component.imageArray, true),
    });
    component.changeImage('next');

    expect(component.active).toEqual(1);
    expect(component.activeLeft).toEqual(0);
    expect(component.activeRight).toEqual(2);
    expect(component.currentActiveIndex.emit).toHaveBeenCalledWith(1);
  });

  it('should emit currentActiveIndex when imageArray has more than two elements and direction is previous', () => {
    spyOn(component.currentActiveIndex, 'emit');

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
      {
        imageUrl: 'image3.jpg',
        title: 'Image 3',
        subTitle: 'Subtitle 223',
      },
    ];
    component.ngOnChanges({
      imageArray: new SimpleChange(null, component.imageArray, true),
    });
    component.changeImage('previous');

    expect(component.active).toEqual(2);
    expect(component.activeLeft).toEqual(1);
    expect(component.activeRight).toEqual(0);
    expect(component.currentActiveIndex.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit currentActiveIndex when imageArray has less than two elements', () => {
    spyOn(component.currentActiveIndex, 'emit');

    component.imageArray = [
      {
        imageUrl: 'image1.jpg',
        title: 'Image 1',
        subTitle: 'Subtitle 1',
      },
    ];
    component.ngOnChanges({
      imageArray: new SimpleChange(null, component.imageArray, true),
    });
    component.changeImage('next');

    expect(component.active).toEqual(0);
    expect(component.activeLeft).toEqual(-1);
    expect(component.activeRight).toEqual(-1);
    expect(component.currentActiveIndex.emit).not.toHaveBeenCalled();
  });

  it('should handle decrementIndex properly', () => {
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
      {
        imageUrl: 'image3.jpg',
        title: 'Image 3',
        subTitle: 'Subtitle 3',
      },
    ];

    expect(component.decrementIndex(2)).toEqual(1);
    expect(component.decrementIndex(0)).toEqual(2);
  });

  it('should handle incrementIndex properly', () => {
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
      {
        imageUrl: 'image3.jpg',
        title: 'Image 3',
        subTitle: 'Subtitle 3',
      },
    ];
    expect(component.incrementIndex(1)).toEqual(2);
    expect(component.incrementIndex(2)).toEqual(0);
  });
});
