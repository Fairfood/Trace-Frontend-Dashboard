/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { DynamicTemplateUploadService } from '../';
import { DynamicTemplateStore } from '../';
// service
import { GlobalStoreService } from 'src/app/shared/store';
// configs
import { UNITS } from 'src/app/shared/configs/app.constants';
import { IMPORT_ITEMS } from './template-form.config';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: IMPORT_ITEMS,
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnInit, OnDestroy {
  @Input() templateSelectionForm: FormGroup;
  @Input() linkFields: boolean;
  @Input() isConnection?: boolean;
  currencies: any[];
  pageApis: Subscription[] = [];
  additionalFields: any[];
  units = UNITS;
  newProduct: boolean;

  constructor(
    private service: DynamicTemplateUploadService,
    private store: DynamicTemplateStore,
    private global: GlobalStoreService
  ) {}

  ngOnInit(): void {
    if (!this.isConnection) {
      this.fetchFieldDetails();
      this.templateChange();
    }
  }

  fetchFieldDetails(): void {
    const sub = this.global.glboalConstants$.subscribe((data: any) => {
      this.currencies = data.currencies;
      this.additionalFields = data.farmer_additional_fields.map((el: any) => {
        el.checked = false;
        return el;
      });
    });
    this.pageApis.push(sub);
  }

  templateChange(): void {
    const sub2 = this.store.templateData$.subscribe({
      next: (template: any) => {
        if (template) {
          this.selectTemplate(template);
        }
      },
    });
    this.pageApis.push(sub2);
  }

  selectTemplate(template: any): void {
    const { currency, id, unit, product_details } = template;
    this.templateSelectionForm.patchValue({
      templateId: id,
      currency,
      unit: unit ? unit?.toString() : '1',
      product: product_details?.id,
      productName: product_details?.name ?? '',
    });
  }

  initTemplateData(template: any): void {
    this.store.updateStateProp<any>('selectedTemplateData', template);
  }

  get ccontrol() {
    return this.templateSelectionForm.controls;
  }

  selectProduct(item: any): void {
    if (item) {
      this.templateSelectionForm.patchValue({
        product: item.id,
      });
      this.newProduct = false;
    } else {
      this.templateSelectionForm.patchValue({
        product: -1,
      });
      this.newProduct = true;
    }
  }

  dropdownSelection(item: any, label: string): void {
    const value = item.id === 'All' ? '' : item.id;
    this.templateSelectionForm.patchValue({
      [label]: value,
    });
  }

  removeUploadedFile(): void {
    /**
     * Template form is used in 2 pages. Link fields and template selection component
     * If link fields is true, then it is used in link fields page. ie. template remove is clicked
     */
    this.service.templateAction$.next('remove');
  }

  /**
   * Trace template selected and have additional fields ( at least one required)
   * @param event any
   * @param i number
   */
  additionalFieldsSelected(event: any, i: number): void {
    this.additionalFields[i].checked = event.checked;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
