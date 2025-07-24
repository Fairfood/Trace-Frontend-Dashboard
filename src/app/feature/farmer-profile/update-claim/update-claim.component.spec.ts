import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateClaimComponent } from './update-claim.component';

describe('UpdateClaimComponent', () => {
  let component: UpdateClaimComponent;
  let fixture: ComponentFixture<UpdateClaimComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UpdateClaimComponent],
    });
    fixture = TestBed.createComponent(UpdateClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
