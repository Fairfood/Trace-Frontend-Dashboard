import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { CompanyClaimsComponent } from './company-claims.component';
import { CompanyProfileService } from '../company-profile.service';

describe('CompanyClaimsComponent', () => {
  let component: CompanyClaimsComponent;
  let fixture: ComponentFixture<CompanyClaimsComponent>;
  let mockDialogRef: Partial<MatDialogRef<CompanyClaimsComponent>>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockDialogRef = { close: jasmine.createSpy('close') };
    mockDialog = { open: jasmine.createSpy('open') };
    await TestBed.configureTestingModule({
      imports: [
        CompanyClaimsComponent,
        CommonModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockDialog },
        { provide: CompanyProfileService, useClass: CompanyProfileServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component', () => {
    spyOn(component, 'getCompanyClaims');
    component.paginatorEvent({ limit: 10, offset: 0 });
    expect(component.loader).toBeTrue();
    expect(component.getCompanyClaims).toHaveBeenCalled();
  });
});

class CompanyProfileServiceStub {
  listCompanyClaims(nodeId: string, limit = 10, offset = 0): Observable<any> {
    return of();
  }
}
