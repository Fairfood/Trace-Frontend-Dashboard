/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { VerifyComponent } from './verify.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('VerifyComponent', () => {
  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;
  beforeEach(() => {
    window.onbeforeunload = jasmine.createSpy();
    TestBed.configureTestingModule({
      imports: [VerifyComponent, HttpClientModule, MatSnackBarModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyComponent);
    component = fixture.componentInstance;
    spyOn(component, 'gotoLogin');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set loaderText and call gotoLogin', () => {
    const dummyMessage = 'Error message';

    component.handleError(dummyMessage);

    expect(component.loaderText).toBe(dummyMessage);
    expect(component.gotoLogin).toHaveBeenCalled();
  });
});
