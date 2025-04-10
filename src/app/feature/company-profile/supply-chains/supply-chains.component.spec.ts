import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplyChainsComponent } from './supply-chains.component';
import { CommonModule } from '@angular/common';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { CompanyProfileService } from '../company-profile.service';
import { Observable, of } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('SupplyChainsComponent', () => {
  let component: SupplyChainsComponent;
  let fixture: ComponentFixture<SupplyChainsComponent>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [SupplyChainsComponent, CommonModule, TranslateModule.forRoot()],
      providers: [
        { provide: CompanyProfileService, useClass: CompanyProfileServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplyChainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load supply chains on ngOnInit', () => {
    spyOn(component, 'getActiveSupplyChains');
    component.ngOnInit();
    expect(component.getActiveSupplyChains).toHaveBeenCalled();
  });

  it('should call loadSupplyChain on paginatorEvent', () => {
    spyOn(component, 'loadSupplyChain');
    const eventData = { limit: 10, offset: 0 };
    component.paginatorEvent(eventData);
    expect(component.loadSupplyChain).toHaveBeenCalled();
  });

  it('should set loader to true and call getActiveSupplyChains on loadSupplyChain', () => {
    spyOn(component, 'getActiveSupplyChains');
    component.loadSupplyChain();
    expect(component.loader).toBeTruthy();
    expect(component.getActiveSupplyChains).toHaveBeenCalled();
  });

  it('Should unsubscribe from all subscriptions on ngOnDestroy', () => {
    const spy = spyOn(component.pageApis[0], 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});

class CompanyProfileServiceStub {
  getActiveSupplyChains(
    companyId: any,
    limit: number,
    offset: number
  ): Observable<any> {
    return of({ count: 0, results: [] });
  }
}
