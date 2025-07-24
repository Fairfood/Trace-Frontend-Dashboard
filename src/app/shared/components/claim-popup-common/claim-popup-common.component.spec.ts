import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPopupCommonComponent } from './claim-popup-common.component';

describe('ClaimPopupCommonComponent', () => {
  let component: ClaimPopupCommonComponent;
  let fixture: ComponentFixture<ClaimPopupCommonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClaimPopupCommonComponent],
    });
    fixture = TestBed.createComponent(ClaimPopupCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
