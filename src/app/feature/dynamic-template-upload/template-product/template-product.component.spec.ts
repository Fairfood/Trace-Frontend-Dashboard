import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TemplateProductComponent } from './template-product.component';
import { GlobalStoreService } from 'src/app/shared/store';

const mockData = [
  {
    id: '1',
    name: 'Product 1',
  },
  {
    id: '2',
    name: 'Product 2',
  },
];

describe('TemplateProductComponent', () => {
  let component: TemplateProductComponent;
  let fixture: ComponentFixture<TemplateProductComponent>;
  let globalStoreServiceSpy: jasmine.SpyObj<GlobalStoreService>;

  beforeEach(async () => {
    const globalSpy = jasmine.createSpyObj('GlobalStoreService', [
      'supplychainProducts$',
    ]);

    globalSpy.supplychainProducts$ = of(mockData);

    await TestBed.configureTestingModule({
      imports: [
        TemplateProductComponent,
        ReactiveFormsModule,
        MatAutocompleteModule,
      ],
      providers: [{ provide: GlobalStoreService, useValue: globalSpy }],
    }).compileComponents();

    globalStoreServiceSpy = TestBed.inject(
      GlobalStoreService
    ) as jasmine.SpyObj<GlobalStoreService>;
    globalStoreServiceSpy.supplychainProducts$ = of([
      { name: 'Product 1' },
      { name: 'Product 2' },
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateProductComponent);
    component = fixture.componentInstance;
    component.productControl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit productSelected event when selectProduct is called', () => {
    const product = { name: 'Product 1' };
    spyOn(component.productSelected, 'emit');

    component.selectProduct(product);

    expect(component.productSelected.emit).toHaveBeenCalledWith(product);
  });

  it('should set newProduct to true when product does not exist in the list', fakeAsync(() => {
    component.newProduct = false;
    component.products = [{ name: 'Product 1' }];
    component.productControl.setValue('Lost');
    tick(800);
    expect(component.newProduct).toBeTruthy();

    component.productControl.setValue('Product 1');
    tick(800);
    expect(component.newProduct).toBeFalsy();
  }));

  it('should set newProduct to false when product exists in the list', () => {
    component.productControl.setValue('Product 1');
    expect(component.newProduct).toBeFalsy();
  });
});
