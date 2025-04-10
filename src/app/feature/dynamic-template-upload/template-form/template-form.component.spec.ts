import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateFormComponent } from './template-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { GlobalStoreService } from 'src/app/shared/store';
import { DynamicTemplateUploadService, DynamicTemplateStore } from '../';
import { TemplateProductComponent } from '../template-product';

describe('TemplateFormComponent', () => {
  let component: TemplateFormComponent;
  let fixture: ComponentFixture<TemplateFormComponent>;
  let mockService: Partial<DynamicTemplateUploadService>;
  let mockStore: Partial<DynamicTemplateStore>;
  let mockGlobalStore: Partial<GlobalStoreService>;
  let globalConstants$: Subscription;

  beforeEach(async () => {
    mockService = {
      templateAction$: new Subject(),
    };

    mockStore = {
      templateData$: of({}),
      updateStateProp: jasmine.createSpy(),
    };

    mockGlobalStore = {
      glboalConstants$: of({
        currencies: [{ id: '1', name: 'USD' }],
        farmer_additional_fields: [{ id: '1', name: 'Field 1' }],
      }),
      supplychainProducts$: of([{ id: '1', name: 'Product 1' }]),
    };

    await TestBed.configureTestingModule({
      imports: [
        TemplateFormComponent,
        ReactiveFormsModule,
        TemplateProductComponent,
      ],
      providers: [
        { provide: DynamicTemplateUploadService, useValue: mockService },
        { provide: DynamicTemplateStore, useValue: mockStore },
        { provide: GlobalStoreService, useValue: mockGlobalStore },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFormComponent);
    component = fixture.componentInstance;
    component.templateSelectionForm = new FormGroup({
      templateId: new FormControl(''),
      currency: new FormControl(''),
      unit: new FormControl(''),
      product: new FormControl(''),
      productName: new FormControl(''),
    });
    component.linkFields = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch field details', () => {
    mockGlobalStore.glboalConstants$.subscribe(() => {
      expect(component.currencies).toEqual([{ id: '1', name: 'USD' }]);
      expect(component.additionalFields).toEqual([
        { id: '1', name: 'Field 1', checked: false },
      ]);
    });
  });

  it('should handle template change', () => {
    const template = {
      currency: 'USD',
      id: '1',
      unit: '2',
      product_details: { id: '1', name: 'Product 1' },
    };
    mockStore.templateData$ = of(template);
    component.templateChange();
    expect(component.templateSelectionForm.value).toEqual({
      templateId: '1',
      currency: 'USD',
      unit: '2',
      product: '1',
      productName: 'Product 1',
    });
  });

  it('should select product', () => {
    const item = { id: '1', name: 'Product 1' };
    component.selectProduct(item);
    expect(component.templateSelectionForm.value.product).toEqual('1');
    expect(component.newProduct).toBe(false);
  });

  it('should set the product to -1 if clear selection', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = null;
    component.selectProduct(item);
    expect(component.templateSelectionForm.value.product).toEqual(-1);
    expect(component.newProduct).toBe(true);
  });

  it('should update state property with selected template data', () => {
    const template = { id: '1', name: 'Template 1' };
    component.initTemplateData(template);
    expect(mockStore.updateStateProp).toHaveBeenCalledWith(
      'selectedTemplateData',
      template
    );
  });

  it('should handle dropdown selection', () => {
    const item = { id: '1', name: 'USD' };
    component.dropdownSelection(item, 'currency');
    expect(component.templateSelectionForm.value.currency).toEqual('1');
  });

  it('should remove uploaded file', () => {
    spyOn(mockService.templateAction$, 'next');
    component.removeUploadedFile();
    expect(mockService.templateAction$.next).toHaveBeenCalledWith('remove');
  });

  it('should handle additional fields selection', () => {
    component.additionalFieldsSelected({ checked: true }, 0);
    expect(component.additionalFields[0].checked).toBe(true);
  });

  it('should unsubscribe onDestroy', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    component.pageApis.push(new Subscription());
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
  });
});
