import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DocUploadComponent } from './doc-upload.component';
import { DocumentationService } from '../documentation.service';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonsComponent } from 'fairfood-utils';

describe('DocUploadComponent', () => {
  let component: DocUploadComponent;
  let fixture: ComponentFixture<DocUploadComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DocUploadComponent>>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatIconModule,
        ButtonsComponent,
        DocUploadComponent,
      ],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: DocumentationService, useClass: DocumentationServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    // Call the close method
    component.close();

    // Check if the close method was called on the mockDialogRef
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should update filename in the form when uploading file', () => {
    // Mock file event
    const mockFile = new File([''], 'test-file.txt');
    const mockEvent = { target: { files: [mockFile] } };

    // Call the uploadFile method
    component.uploadFile(mockEvent);

    // Check if the filename is updated in the form
    expect(component.filename).toEqual('test-file.txt');
    expect(component.uploadForm.value.name).toEqual('test-file.txt');
  });

  it('should delete attachment from files array', () => {
    // Set up initial files array
    component.files = ['file1', 'file2', 'file3'];

    // Call the deleteAttachment method
    component.deleteAttachment(1); // Delete 'file2'

    // Check if 'file2' is removed from the files array
    expect(component.files).toEqual(['file1', 'file3']);
  });
});

class DocumentationServiceStub {
  uploadDoc(formData: FormData) {
    return of({ success: true });
  }
}
