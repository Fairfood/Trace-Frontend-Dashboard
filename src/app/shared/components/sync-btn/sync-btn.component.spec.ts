import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncBtnComponent } from './sync-btn.component';

describe('SyncBtnComponent', () => {
  let component: SyncBtnComponent;
  let fixture: ComponentFixture<SyncBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SyncBtnComponent],
    });
    fixture = TestBed.createComponent(SyncBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
