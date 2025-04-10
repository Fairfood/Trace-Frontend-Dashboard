import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NotificationWidgetComponent } from './notification-widget.component';
import { NotificationService } from '../notification.service';
import { GlobalStoreService } from 'src/app/shared/store';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AvatarNotificationPipe } from '../notification.pipe';
import { SwitchCompanyComponent } from '../switch-company/switch-company.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('NotificationWidgetComponent', () => {
  let component: NotificationWidgetComponent;
  let fixture: ComponentFixture<NotificationWidgetComponent>;
  let notificationService: NotificationService;
  let matDialog: MatDialog;
  let routeService: RouterService;

  beforeEach(async () => {
    const activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ id: '123' }),
      },
    };
    const utilServiceMock = {
      customSnackBar() {
        console.log('hi');
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        NotificationWidgetComponent,
        AvatarNotificationPipe,
        SwitchCompanyComponent,
        CommonModule,
        MatMenuModule,
        MatDialogModule,
        HttpClientModule,
      ],
      providers: [
        NotificationService,
        GlobalStoreService,
        RouterService,
        StorageService,
        { provide: UtilService, useValue: utilServiceMock },
        MatDialog,
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();
    routeService = TestBed.inject(RouterService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationWidgetComponent);
    component = fixture.componentInstance;
    matDialog = TestBed.inject(MatDialog);
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear newNotification flag', () => {
    component.newNotification = true;
    component.clearNewNotification();
    expect(component.newNotification).toBeFalsy();
  });

  it('should call service readNotification with correct parameters and update unreadNotification to 0 for readAll', () => {
    const readNotificationSpy = spyOn(
      notificationService,
      'readNotification'
    ).and.returnValue(of(true));
    component.unreadNotification = 5;
    component.readNotification({ all: true }, true);
    expect(readNotificationSpy).toHaveBeenCalledWith({ all: true });
    expect(component.unreadNotification).toBe(0);
  });

  it('should decrement unreadNotification and mark notification as read for single notification', () => {
    const notification = { id: '123', is_read: false };
    spyOn(notificationService, 'readNotification').and.returnValue(of(true));
    component.unreadNotification = 5;
    component.readNotification({ ids: ['123'] }, false, notification);
    expect(component.unreadNotification).toBe(4);
    expect(notification.is_read).toBe(true);
  });

  it('should handle error properly', () => {
    spyOn(notificationService, 'readNotification').and.returnValue(
      throwError('Error')
    );
    component.readNotification({}, true);
    expect(component.unreadNotification).toBeUndefined();
  });

  it('should navigate to /user-profile when viewAll() is called', fakeAsync(() => {
    const navigateUrlSpy = spyOn(routeService, 'navigateUrl');

    component.viewAll();
    tick();

    expect(navigateUrlSpy).toHaveBeenCalledWith('/user-profile');
  }));
});
