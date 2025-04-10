import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ConnectionMappingComponent } from './connection-mapping.component';
import { LoaderComponent } from 'fairfood-utils';

describe('ConnectionMappingComponent', () => {
  let component: ConnectionMappingComponent;
  let fixture: ComponentFixture<ConnectionMappingComponent>;

  beforeEach(waitForAsync(() => {
    const mockSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'onLangChange',
      'instant',
    ]);
    TestBed.configureTestingModule({
      imports: [
        MatCheckboxModule,
        MatIconModule,
        FormsModule,
        ConnectionMappingComponent,
        LoaderComponent,
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit loadMoreData event when loadMore is called', () => {
    spyOn(component.loadMoreData, 'emit');
    component.loadMore();
    expect(component.loadMoreData.emit).toHaveBeenCalled();
  });

  it('should toggle selectAll and emit updateRadio event when modelChange is called', () => {
    spyOn(component.updateRadio, 'emit');
    component.modelChange();
    expect(component.selectAll).toBe(true);
    expect(component.updateRadio.emit).toHaveBeenCalledWith(true);

    component.modelChange();
    expect(component.selectAll).toBe(false);
    expect(component.updateRadio.emit).toHaveBeenCalledWith(false);
  });

  it('should toggle selected property of supply item when updateTagging is called', () => {
    const supply = { id: 1, name: 'Supply', selected: false };
    component.updateTagging(supply);
    expect(supply.selected).toBe(true);

    component.updateTagging(supply);
    expect(supply.selected).toBe(false);
  });

  it('should return the item id as the trackBy value', () => {
    const index = 1;
    const item = { id: 'example_id', name: 'Example Item' };
    const result = component.trackByFn(index, item);
    expect(result).toBe('example_id');
  });
});
