import { ShrinkPipe } from './wizard-step.pipe';

describe('ShrinkPipe', () => {
  let pipe: ShrinkPipe;

  beforeEach(() => {
    pipe = new ShrinkPipe();
  });

  it('should create an instance of the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true for elements that should be shrunk', () => {
    const list = [1, 2, 3, 4, 5];
    const activeIndex = 0;

    // Test cases where elements should be shrunk
    expect(pipe.transform(list, 3, activeIndex)).toBe(true);
    expect(pipe.transform(list, 4, activeIndex)).toBe(true);
  });

  it('should return false for elements that should not be shrunk', () => {
    const list = [1, 2, 3];
    const activeIndex = 1;

    // Test cases where elements should not be shrunk
    expect(pipe.transform(list, 0, activeIndex)).toBe(false);
    expect(pipe.transform(list, 1, activeIndex)).toBe(false);
    expect(pipe.transform(list, 2, activeIndex)).toBe(false);
  });

  it('should return false when the list length is less than or equal to 3', () => {
    const list = [1, 2, 3];
    const activeIndex = 0;

    expect(pipe.transform(list, 0, activeIndex)).toBe(false);
    expect(pipe.transform(list, 1, activeIndex)).toBe(false);
    expect(pipe.transform(list, 2, activeIndex)).toBe(false);
  });

  it('should return true when activeIndex is not 0 and index is 0 or 1', () => {
    const list = [1, 2, 3, 4];
    const activeIndex = 2;

    expect(pipe.transform(list, 0, activeIndex)).toBe(true);
    expect(pipe.transform(list, 1, activeIndex)).toBe(true);
  });

  it('should return true when activeIndex is 0 and index is list length - 1 or list length - 2', () => {
    const list = [1, 2, 3, 4];
    const activeIndex = 0;

    expect(pipe.transform(list, 2, activeIndex)).toBe(true);
    expect(pipe.transform(list, 3, activeIndex)).toBe(true);
  });

  it('should return true for elements that should be shrunk when list length is 2 and activeIndex is 0', () => {
    const list = [1, 2];
    const activeIndex = 0;

    // Test cases where elements should be shrunk
    expect(pipe.transform(list, 1, activeIndex)).toBe(false);
  });
});
