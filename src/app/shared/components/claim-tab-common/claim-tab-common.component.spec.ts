import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimTabCommonComponent } from './claim-tab-common.component';

describe('ClaimTabCommonComponent', () => {
  let component: ClaimTabCommonComponent;
  let fixture: ComponentFixture<ClaimTabCommonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClaimTabCommonComponent],
    });
    fixture = TestBed.createComponent(ClaimTabCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
