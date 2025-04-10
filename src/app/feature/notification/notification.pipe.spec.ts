import { FilterTodayPipe, AvatarNotificationPipe } from './notification.pipe';
import { TestBed } from '@angular/core/testing';

describe('FilterTodayPipe', () => {
  let pipe: FilterTodayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterTodayPipe],
    });
    pipe = TestBed.inject(FilterTodayPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should filter items based on the today property', () => {
    const items = [
      { id: 1, today: true },
      { id: 2, today: false },
      { id: 3, today: true },
    ];

    expect(pipe.transform(items, true)).toEqual([
      { id: 1, today: true },
      { id: 3, today: true },
    ]);
    expect(pipe.transform(items, false)).toEqual([{ id: 2, today: false }]);
  });
});

describe('AvatarNotificationPipe', () => {
  let pipe: AvatarNotificationPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AvatarNotificationPipe],
    });
    pipe = TestBed.inject(AvatarNotificationPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return initials from a full name string', () => {
    expect(pipe.transform('John Doe')).toBe('JD');
    expect(pipe.transform('Alice Wonderland')).toBe('AW');
  });

  it('should handle empty or invalid input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
