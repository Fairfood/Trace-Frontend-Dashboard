import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe', () => {
  let pipe: DateAgoPipe;

  beforeEach(() => {
    pipe = new DateAgoPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a date into "Just now" for less than 30 seconds ago', () => {
    const now = Math.floor(Date.now() / 1000);
    const past = now - 20; // 20 seconds ago
    const result = pipe.transform(past);
    expect(result).toBe('Just now');
  });

  it('should transform a date into "X second(s) ago" for seconds', () => {
    const now = Math.floor(Date.now() / 1000);
    const past = now - 45; // 45 seconds ago
    const result = pipe.transform(past);
    expect(result).toBe('45 seconds ago');
  });

  it('should transform a date into "X minute(s) ago" for minutes', () => {
    const now = Math.floor(Date.now() / 1000);
    const past = now - 120; // 2 minutes ago
    const result = pipe.transform(past);
    expect(result).toBe('2 minutes ago');
  });

  // Add more test cases for other time intervals (hours, days, weeks, months, years)

  it('should return the date if value is undefined', () => {
    const result = pipe.transform('');
    // Use the Date.toISOString() method to format the expected date as a string
    const expectedDate = new Date(1 * 1000);
    expect(typeof result).toBe(typeof expectedDate);
  });
});
