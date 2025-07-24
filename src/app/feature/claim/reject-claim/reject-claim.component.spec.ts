import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectClaimComponent } from './reject-claim.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

describe('RejectClaimComponent', () => {
  let component: RejectClaimComponent;
  let fixture: ComponentFixture<RejectClaimComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RejectClaimComponent,
        MatDialogModule,
        HttpClientModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatIconModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
