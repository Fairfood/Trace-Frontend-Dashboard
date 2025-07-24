import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UtilService } from 'src/app/shared/service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  beforeEach(async () => {
    const utilSpyObj = jasmine.createSpyObj('UtilService', [
      'generateTotpToken',
    ]);
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
      ],
      providers: [
        {
          provide: UtilService,
          useValue: utilSpyObj,
        },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should set companyID in localStorage if nodeId is present', () => {
    component.nodeId = '789';
    spyOn(localStorage, 'setItem');
    component.manageUser();

    expect(localStorage.setItem).toHaveBeenCalledWith('companyID', '789');
  });

  it('should unsubscribe from the subscription on ngOnDestroy', () => {
    // Mock the subscription
    const mockSubscription = new Subscription();
    spyOn(mockSubscription, 'unsubscribe');
    component.subscription = mockSubscription;

    // Call ngOnDestroy
    component.ngOnDestroy();

    // Check that unsubscribe was called on the subscription
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should not throw error when subscription is undefined on ngOnDestroy', () => {
    // Set subscription to undefined
    component.subscription = undefined;

    // Call ngOnDestroy and expect no errors
    expect(() => component.ngOnDestroy()).not.toThrowError();
  });
});
