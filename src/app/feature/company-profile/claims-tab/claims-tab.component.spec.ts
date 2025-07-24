import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsTabComponent } from './claims-tab.component';

describe('ClaimsTabComponent', () => {
  let component: ClaimsTabComponent;
  let fixture: ComponentFixture<ClaimsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClaimsTabComponent],
    });
    fixture = TestBed.createComponent(ClaimsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
