/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ClaimService } from '../claim.service';
import { UtilService } from 'src/app/shared/service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimInformationComponent } from './claim-information.component';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('ClaimInformationComponent', () => {
  let component: ClaimInformationComponent;
  let fixture: ComponentFixture<ClaimInformationComponent>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    const activatedRouteStub = { snapshot: { params: { id: 'some_id' } } };

    await TestBed.configureTestingModule({
      imports: [ClaimInformationComponent, HttpClientModule],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: ClaimService, useClass: ClaimServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and call claimDetails', () => {
    spyOn(component, 'claimDetails').and.callThrough();
    component.ngOnInit();
    expect(component.claimDetails).toHaveBeenCalledWith('some_id');
  });

  it('should change tab', () => {
    const mockTab = { id: 'test_tab', name: 'Test' };
    component.changeTab(mockTab);
    expect(component.currentTab).toBe('test_tab');
  });

  it('should navigate to transaction report', () => {
    spyOn(component.router, 'navigate').and.stub();
    component.currentClaim = {
      transaction: { transaction_type: 1, id: 'test_id' },
    };
    component.viewTransaction();
    expect(component.router.navigate).toHaveBeenCalledWith([
      'transaction-report',
      'external',
      'test_id',
    ]);
  });

  it('should add comments', fakeAsync(() => {
    spyOn(component.service, 'addComments').and.returnValue(
      of({ success: true })
    );

    component.detailsForm.setValue({ comments: 'Test comment' });
    component.addComments();
    tick(); // Wait for Observable to resolve
    expect(component.service.addComments).toHaveBeenCalled();
    expect(component.detailsForm.get('comments').value).toBe(null);
    expect(component.updatingComment).toBeFalsy();
  }));

  it('should unsubscribe from subscriptions onDestroy', () => {
    spyOn(component.pageApis[0], 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
  });
});

class UtilServiceStub {
  customSnackBar(): void {
    console.log('hi');
  }

  downloadReceipt(url: string): Observable<any> {
    return new BehaviorSubject({});
  }
}

class ClaimServiceStub {
  getVerificationDetails(): Observable<any> {
    return of({ id: 'mock_claim_id' });
  }

  addComments(): Observable<any> {
    return new BehaviorSubject({ success: true });
  }
}
