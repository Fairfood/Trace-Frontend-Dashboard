/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
} from 'rxjs';
// material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
// other components
import { LoaderComponent, ButtonsComponent } from 'fairfood-utils';
// services
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';

import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';

@Component({
  selector: 'app-template-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ButtonsComponent,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule,
    LoaderComponent,
  ],
  templateUrl: './template-dropdown.component.html',
  styleUrls: ['./template-dropdown.component.scss'],
})
export class TemplateDropdownComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() template: FormControl;
  @Input() templateList: any;
  @Input() showRemove: boolean;
  @Output() templateChange = new EventEmitter<any>();
  @Output() customUploadClicked = new EventEmitter<any>();

  templateList$: Observable<any>;
  uploadType = this.store.getCurrentTemplateType();
  templateLoader = true;

  constructor(
    private service: DynamicTemplateUploadService,
    private store: DynamicTemplateStore
  ) {}

  ngOnInit(): void {
    this.templateList$ = this.form.get('templateName').valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      startWith(''),
      map(val => val ?? ''),
      switchMap(value => {
        this.templateLoader = true;
        return this.service.availableTemplates(this.uploadType, value).pipe(
          finalize(() => (this.templateLoader = false)) // Hide loader on completion or error
        );
      })
    );
  }

  initTemplateData(template: any): void {
    this.form.get('templateName').patchValue(template.name);
    this.form.get('templateId').patchValue(template.id);
    this.store.updateStateProp<any>('selectedTemplateData', template);
  }

  customUpload(): void {
    this.service.templateAction$.next('new');
  }
}
