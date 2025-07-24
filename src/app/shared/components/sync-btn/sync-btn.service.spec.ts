import { TestBed } from '@angular/core/testing';

import { SyncBtnService } from './sync-btn.service';

describe('SyncBtnService', () => {
  let service: SyncBtnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncBtnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
