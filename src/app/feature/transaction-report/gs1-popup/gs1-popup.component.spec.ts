import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gs1PopupComponent } from './gs1-popup.component';

describe('Gs1PopupComponent', () => {
  let component: Gs1PopupComponent;
  let fixture: ComponentFixture<Gs1PopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Gs1PopupComponent],
    });
    fixture = TestBed.createComponent(Gs1PopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
