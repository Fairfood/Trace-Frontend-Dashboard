import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateDropdownComponent } from './template-dropdown.component';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';

describe('TemplateDropdownComponent', () => {
  let component: TemplateDropdownComponent;
  let fixture: ComponentFixture<TemplateDropdownComponent>;
  let mockService: Partial<DynamicTemplateUploadService>;
  let mockStore: Partial<DynamicTemplateStore>;

  beforeEach(async () => {
    mockService = {
      availableTemplates: jasmine.createSpy().and.returnValue(of([])),
      templateAction$: new Subject(),
    };

    mockStore = {
      getCurrentTemplateType: jasmine.createSpy().and.returnValue(1),
      updateStateProp: jasmine.createSpy(),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      // use: () => {},
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatIconModule,
        TemplateDropdownComponent,
        TranslateModule,
      ],
      providers: [
        { provide: DynamicTemplateUploadService, useValue: mockService },
        { provide: DynamicTemplateStore, useValue: mockStore },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDropdownComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      templateName: new FormControl(''),
      templateId: new FormControl(''),
    });
    component.template = new FormControl('');
    component.templateList = [];
    component.showRemove = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize templateList$ observable', () => {
    component.ngOnInit();
    expect(component.templateList$).toBeDefined();
  });

  it('should call availableTemplates', () => {
    component.ngOnInit();
    expect(mockService.availableTemplates).toHaveBeenCalledWith(1, '');
  });

  it('should emit customUploadClicked event', () => {
    spyOn(mockService.templateAction$, 'next');
    component.customUpload();
    expect(mockService.templateAction$.next).toHaveBeenCalledWith('new');
  });

  it('should initialize template data', () => {
    const template = { id: '1', name: 'Template 1' };
    component.initTemplateData(template);
    expect(component.form.get('templateName').value).toEqual(template.name);
    expect(component.form.get('templateId').value).toEqual(template.id);
    expect(mockStore.updateStateProp).toHaveBeenCalledWith(
      'selectedTemplateData',
      template
    );
  });
});
