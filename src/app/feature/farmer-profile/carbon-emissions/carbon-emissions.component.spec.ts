import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonEmissionsComponent } from './carbon-emissions.component';

describe('CarbonEmissionsComponent', () => {
  let component: CarbonEmissionsComponent;
  let fixture: ComponentFixture<CarbonEmissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CarbonEmissionsComponent],
    });
    fixture = TestBed.createComponent(CarbonEmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
