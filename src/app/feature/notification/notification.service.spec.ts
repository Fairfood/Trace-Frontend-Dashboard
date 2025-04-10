import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { RouterService } from 'src/app/shared/service';
import {
  NotificationEvent,
  NotificationRequestType,
} from 'src/app/shared/configs/app.constants';
import {
  ActivatedRoute,
  RouterModule,
  convertToParamMap,
} from '@angular/router';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationService,
        RouterService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}), // Mock paramMap
            },
          },
        },
      ],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle stock event correctly', () => {
    const navigateToRequestsSpy = spyOn(
      service,
      'navigateToRequests'
    ).and.stub();
    const notification = {
      event_id: 'eventId',
      type: NotificationRequestType.Type1,
    };
    service.handleStockEvent(notification);
    expect(navigateToRequestsSpy).toHaveBeenCalledWith(1, 'eventId');
  });
});
