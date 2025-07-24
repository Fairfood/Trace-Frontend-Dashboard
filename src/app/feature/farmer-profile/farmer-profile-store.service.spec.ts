import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FarmerProfileStoreService } from './farmer-profile-store.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { DatePipe } from '@angular/common';

describe('FarmerProfileStoreService', () => {
  let service: FarmerProfileStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GlobalStoreService, FarmerProfileStoreService, DatePipe],
    });
    service = TestBed.inject(FarmerProfileStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should transform form values correctly', () => {
    // Arrange
    const farmerDetails = {
      firstName: 'John',
      lastName: 'Doe',
      familyMembers: 4,
      dialCode: '+1',
      phoneNumber: '123456789',
      city: 'New York',
      country: 'USA',
      province: 'NY',
      street: '123 Main St',
      email: 'john@example.com',
      zipCode: '10001',
      dob: new Date('1990-01-01'),
      gender: 'Male',
      type: 'Farming',
      cStatus: 'Consented',
    };

    // Act
    const transformedValues = service.transformFormValues(farmerDetails);

    // Assert
    expect(transformedValues).toEqual({
      first_name: 'John',
      last_name: 'Doe',
      family_members: 4,
      phone: {
        dial_code: '+1',
        phone: '123456789',
      },
      city: 'New York',
      country: 'USA',
      province: 'NY',
      street: '123 Main St',
      email: 'john@example.com',
      zipcode: '10001',
      dob: new DatePipe('en-US').transform(
        new Date('1990-01-01'),
        'yyyy-MM-dd'
      ),
      gender: 'Male',
      consent_status: 'Consented',
      primary_operation: 'Farming',
    });
  });

  describe('formatNumber', () => {
    // Test formatNumber method
    it('should format number correctly', () => {
      const value = 1000;
      const formattedNumber = service.formatNumber(value);
      expect(formattedNumber).toBe('1,000'); // Adjust based on your expected formatted number
    });
    it('should format zero correctly', () => {
      // Arrange
      const value = 0;

      // Act
      const formattedNumber = service.formatNumber(value);

      // Assert
      expect(formattedNumber).toEqual('0');
    });
    it('should format two digits correctly', () => {
      // Arrange
      const value = 12;

      // Act
      const formattedNumber = service.formatNumber(value);

      // Assert
      expect(formattedNumber).toEqual('12');
    });

    it('should format three digits correctly', () => {
      // Arrange
      const value = 123;

      // Act
      const formattedNumber = service.formatNumber(value);

      // Assert
      expect(formattedNumber).toEqual('123');
    });
  });

  it('should format the product amount correctly', () => {
    // Arrange
    const amount = 1000;
    const currency = 'USD';

    // Act
    const formattedAmount = service.productAmount(amount, currency);

    // Assert
    expect(formattedAmount).toEqual('1,000 USD');
  });

  describe('transformDetails', () => {
    it('should transform farmer details correctly', () => {
      spyOn(service, 'updateStateProp');

      const farmerDetails = {
        first_name: 'John',
        last_name: 'Doe',
        phone: { dial_code: '+1', phone: '1234567890' },
        family_members: 4,
        total_income: {
          total_amount: [{ amount: 5000, currency: 'USD' }],
          amount_from_products: [{ amount: 3000, currency: 'USD' }],
          amount_from_premiums: [{ amount: 2000, currency: 'USD' }],
        },
      };

      // Act
      service.transformDetails(farmerDetails);

      // Assert
      expect(service.updateStateProp).toHaveBeenCalledWith('farmerDetails', {
        ...farmerDetails,
        firstName: 'John',
        lastName: 'Doe',
        familyMembers: 4,
        dialCode: '+1',
        phoneNumber: '1234567890',
        avatar: 'JD',
        income: {
          product: '3,000 USD',
          premium: '2,000 USD',
          others: '0 USD',
          total: '5,000 USD',
        },
        otherApiCall: true,
      });
    });

    it('should give the correct result if total_income is not present in the API', () => {
      spyOn(service, 'updateStateProp');

      const farmerDetails = {
        first_name: 'John',
        last_name: 'Doe',
        phone: { dial_code: '+1', phone: '1234567890' },
        family_members: 4,
      };

      // Act
      service.transformDetails(farmerDetails);

      // Assert
      expect(service.updateStateProp).toHaveBeenCalledWith('farmerDetails', {
        ...farmerDetails,
        firstName: 'John',
        lastName: 'Doe',
        familyMembers: 4,
        dialCode: '+1',
        phoneNumber: '1234567890',
        avatar: 'JD',
        income: {
          product: '0',
          premium: '0',
          others: '0',
          total: '0',
        },
        otherApiCall: true,
      });
    });

    it('should give the correct result if total_income is an empty object', () => {
      spyOn(service, 'updateStateProp');

      const farmerDetails = {
        first_name: 'John',
        last_name: 'Doe',
        phone: { dial_code: '+1', phone: '1234567890' },
        family_members: 4,
        total_income: {},
      };

      // Act
      service.transformDetails(farmerDetails);

      // Assert
      expect(service.updateStateProp).toHaveBeenCalledWith('farmerDetails', {
        ...farmerDetails,
        firstName: 'John',
        lastName: 'Doe',
        familyMembers: 4,
        dialCode: '+1',
        phoneNumber: '1234567890',
        avatar: 'JD',
        income: {
          product: '0',
          premium: '0',
          others: '0',
          total: '0',
        },
        otherApiCall: true,
      });
    });

    it('should give the correct result if either premium has no value', () => {
      spyOn(service, 'updateStateProp');

      const farmerDetails = {
        first_name: 'John',
        last_name: 'Doe',
        phone: { dial_code: '+1', phone: '1234567890' },
        family_members: 4,
        total_income: {
          total_amount: [{ amount: 5000, currency: 'INR' }],
          amount_from_premiums: [{ amount: 2000, currency: 'USD' }],
        },
      };

      // Act
      service.transformDetails(farmerDetails);

      // Assert
      expect(service.updateStateProp).toHaveBeenCalledWith('farmerDetails', {
        ...farmerDetails,
        firstName: 'John',
        lastName: 'Doe',
        familyMembers: 4,
        dialCode: '+1',
        phoneNumber: '1234567890',
        avatar: 'JD',
        income: {
          product: '0',
          premium: '2,000 USD',
          others: '0 INR',
          total: '5,000 INR',
        },
        otherApiCall: true,
      });
    });
  });
});
