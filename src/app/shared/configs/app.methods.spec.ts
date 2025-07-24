import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  MustMatch,
  checkIfToday,
  convertDateStringToTimestamp,
  getAdditionalFilters,
  getCustomCookie,
  mapResults,
  notOnlyWhitespace,
  removeSpaces,
  successFormatter,
} from './app.methods'; // Replace with the actual file path

describe('MustMatch Validator', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormBuilder],
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should not set an error if the fields match', () => {
    const formGroup = formBuilder.group(
      {
        password: ['password123', Validators.required],
        confirmPassword: ['password123', Validators.required],
      },
      { validators: MustMatch('password', 'confirmPassword') }
    );

    expect(formGroup.valid).toBe(true);
    expect(formGroup.get('confirmPassword').hasError('mustMatch')).toBe(false);
  });

  it('should set an error if the fields do not match', () => {
    const formGroup = formBuilder.group(
      {
        password: ['password123', Validators.required],
        confirmPassword: ['password456', Validators.required],
      },
      { validators: MustMatch('password', 'confirmPassword') }
    );

    expect(formGroup.valid).toBe(false);
    expect(formGroup.get('confirmPassword').hasError('mustMatch')).toBe(true);
  });
});

describe('removeSpaces Validator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should not modify the value if it contains non-space characters', () => {
    const control = new FormControl('Test Value');
    const result = removeSpaces(control);
    expect(control.value).toBe('Test Value');
    expect(result).toBeNull();
  });

  it('should set the control value to an empty string if it contains only spaces', () => {
    const control = new FormControl('    ');
    const result = removeSpaces(control);
    expect(control.value).toBe('');
    expect(result).toBeNull();
  });
});

describe('successFormatter', () => {
  it('should return data if code is 200', () => {
    const response = { code: 200, data: { id: 1, name: 'Test' } };
    expect(successFormatter(response)).toEqual(response.data);
  });

  it('should return original response if code is not 200', () => {
    const response = { code: 404, data: 'Not Found' };
    expect(successFormatter(response)).toEqual(response);
  });

  // Add more tests for different scenarios
});

describe('getCustomCookie', () => {
  let originalDocumentCookie: string;

  beforeEach(() => {
    // Store the original value of document.cookie
    originalDocumentCookie = document.cookie;
  });

  afterEach(() => {
    // Restore the original value of document.cookie
    document.cookie = originalDocumentCookie;
  });

  it('should return the value of the specified cookie', () => {
    // Set up a mock document.cookie
    document.cookie = 'test_cookie=test_value;';

    // Call the function
    const result = getCustomCookie('test_cookie');

    // Assert the result
    expect(result).toEqual('test_value');
  });

  it('should return "no-match" if the specified cookie is not found', () => {
    // Set up a mock document.cookie
    document.cookie = 'test_cookie=test_value;';

    // Call the function with a non-existing cookie name
    const result = getCustomCookie('non_existing_cookie');

    // Assert the result
    expect(result).toEqual('no-match');
  });
});

describe('getAdditionalFilters', () => {
  it('should return an array of additional filters for transaction', () => {
    // Call the function with isTransaction set to true
    const filters = getAdditionalFilters(true);

    // Assert the returned array and its contents
    expect(filters).toEqual([
      {
        name: 'Transaction date',
        visible: false,
        id: 'date',
      },
      {
        name: 'Quantity available',
        visible: false,
        id: 'quantity',
      },
    ]);
  });

  it('should return an array of additional filters for non-transaction', () => {
    // Call the function with isTransaction set to false
    const filters = getAdditionalFilters(false);

    // Assert the returned array and its contents
    expect(filters).toEqual([
      {
        name: 'Created date',
        visible: false,
        id: 'date',
      },
      {
        name: 'Quantity available',
        visible: false,
        id: 'quantity',
      },
    ]);
  });
});

describe('checkIfToday', () => {
  it('should return true if the provided date is today', () => {
    // Call checkIfToday with today's date
    const result = checkIfToday(new Date().getTime() / 1000);

    // Assert that it returns true
    expect(result).toBe(true);
  });

  it('should return false if the provided date is not today', () => {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Call checkIfToday with yesterday's date
    const result = checkIfToday(yesterday.getTime() / 1000);

    // Assert that it returns false
    expect(result).toBe(false);
  });
});

describe('convertDateStringToTimestamp', () => {
  it('should convert a date string to a timestamp', () => {
    const dateString = '2024-02-29T12:00:00Z';
    const expectedTimestamp = 1709208000; // Timestamp for February 29, 2024, at 12:00:00 UTC

    const result = convertDateStringToTimestamp(dateString);

    expect(result).toBe(expectedTimestamp);
  });
});

describe('mapResults', () => {
  it('should return the results from the provided data object', () => {
    const testData = { data: { results: [1, 2, 3] } };
    const expectedResult = [1, 2, 3];

    const result = mapResults(testData);

    expect(result).toEqual(expectedResult);
  });
});

describe('notOnlyWhitespace Validator', () => {
  let validatorFn: (control: AbstractControl) => { [key: string]: any } | null;

  beforeEach(() => {
    validatorFn = notOnlyWhitespace(); // Initialize the validator function
  });

  it('should return null if the control value contains non-whitespace characters', () => {
    const control = new FormControl('Some text');
    expect(validatorFn(control)).toBeNull();
  });

  it('should return null if the control value contains only whitespace characters', () => {
    const control = new FormControl('    ');
    expect(validatorFn(control)).toEqual({ notOnlyWhitespace: true });
  });
});
