import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadDocumentComponent } from './upload-document.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

describe('UploadDocumentComponent', () => {
  let component: UploadDocumentComponent;
  let fixture: ComponentFixture<UploadDocumentComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UploadDocumentComponent>>;
  const mockDialogData = { heading: 'Test Heading' };

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [UploadDocumentComponent],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
      imports: [
        ReactiveFormsModule,
        MatIconModule,
        FairFoodInputComponent,
        ButtonsComponent,
      ],
    });

    fixture = TestBed.createComponent(UploadDocumentComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should upload a receipt file', () => {
    const fileEvent = {
      target: {
        files: [new File([], 'test-file.txt')],
      },
    };

    component.uploadReceipt(fileEvent);

    expect(component.receiptForm.get('file').value).toEqual(
      fileEvent.target.files[0]
    );
  });

  it('should remove a file', () => {
    component.receiptForm.get('file').setValue(new File([], 'test-file.txt'));
    component.removeFile();
    expect(component.receiptForm.get('file').value).toBe('');
  });

  it('should upload a file when valid', () => {
    const validFile = new File([], 'valid-file.txt');
    component.receiptForm.get('file').setValue(validFile);

    component.uploadFile();

    expect(dialogRef.close).toHaveBeenCalledWith({
      file: validFile,
      fileName: 'Receipt',
    });
  });

  it('should not upload a file when invalid', () => {
    const invalidFile = new File([], 'invalid-file.txt');
    component.uploadFile();

    expect(dialogRef.close).not.toHaveBeenCalledWith({
      file: invalidFile,
      fileName: 'Receipt',
    });
  });
});
