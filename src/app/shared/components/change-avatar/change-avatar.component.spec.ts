import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeAvatarComponent } from './change-avatar.component';
import { UtilService } from '../../service';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

describe('ChangeAvatarComponent', () => {
  let component: ChangeAvatarComponent;
  let fixture: ComponentFixture<ChangeAvatarComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  const mockData = {
    image: 'mock-image',
    roundCrope: true,
  };

  const mockUtilService = {
    customSnackBar: jasmine.createSpy('customSnackBar'),
  };

  const mockSpy = jasmine.createSpyObj('TranslateService', ['get']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ChangeAvatarComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: UtilService, useValue: mockUtilService },
        { provide: TranslateService, useValue: mockSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ type: 'dismiss' });
  });

  it('should show a snackbar when image loading fails', () => {
    component.loadImageFailed();
    expect(mockUtilService.customSnackBar).toHaveBeenCalledWith(
      'Image upload failed',
      jasmine.any(String)
    );
  });

  it('should set the cropped image and enable save', () => {
    component.croppedImage = 'cropped-image';
    component.crop();
    expect(component.croppedImg).toBe('cropped-image');
    expect(component.savePro).toBe(true);
  });

  it('should set deleteProfilePic to true when delete is called', () => {
    component.delete();
    expect(component.deleteProfilePic).toBe(true);
  });

  it('should set deleteProfilePic to false when cancel is called', () => {
    component.deleteProfilePic = true;
    component.cancel();
    expect(component.deleteProfilePic).toBe(false);
  });

  it('should set roundCrope property based on input data', () => {
    // Arrange
    const testData = { image: 'mock-image', roundCrope: true };

    // Act
    component.ngOnInit();

    // Assert
    expect(component.roundCrope).toBe(testData.roundCrope);
  });

  it('should update imageChangedEvent property in fileChangeEvent', () => {
    // Arrange
    const mockEvent = 'mock-event';

    // Act
    component.fileChangeEvent(mockEvent);

    // Assert
    expect(component.imageChangedEvent).toBe(mockEvent);
  });

  it('should update croppedImage property in imageCropped', () => {
    // Arrange
    const mockBase64 = 'mock-base64';
    const mockEvent: ImageCroppedEvent = {
      base64: mockBase64,
    } as ImageCroppedEvent;

    // Act
    component.imageCropped(mockEvent);

    // Assert
    expect(component.croppedImage).toBe(mockBase64);
  });

  it('should close the dialog with delete type and empty image data in confirmDelete', () => {
    // Act
    component.confirmDelete();

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      type: 'delete',
      formData: jasmine.any(FormData),
      image: '',
    });
  });
});
