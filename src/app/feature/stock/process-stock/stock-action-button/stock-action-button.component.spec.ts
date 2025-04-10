import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockActionButtonComponent } from './stock-action-button.component';
import { CommonModule } from '@angular/common';
import { ButtonsComponent } from 'fairfood-utils';

describe('StockActionButtonComponent', () => {
  let component: StockActionButtonComponent;
  let fixture: ComponentFixture<StockActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockActionButtonComponent, CommonModule, ButtonsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the type of button clicked', () => {
    spyOn(component.buttonsClicked, 'next');

    // Simulate a button click
    component.buttonNavigation('next');

    // Expect the buttonsClicked event to have been emitted with the correct type
    expect(component.buttonsClicked.next).toHaveBeenCalledWith('next');
  });
});
