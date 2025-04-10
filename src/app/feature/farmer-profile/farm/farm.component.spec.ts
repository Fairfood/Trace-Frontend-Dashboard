import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmerProfileStoreService } from '../';
import { UtilService } from 'src/app/shared/service';
import { FarmComponent } from './farm.component';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

const mockPlots = {
  results: [
    {
      id: 1,
      name: 'test',
      plot_type: 'test',
      area: 1,
      location_type: 'APPROXIMATE',
      country: 'India',
      province: 'test',
    },
  ],
  count: 1,
  loading: false,
};

describe('FarmComponent', () => {
  let component: FarmComponent;
  let fixture: ComponentFixture<FarmComponent>;
  let storeMock: jasmine.SpyObj<FarmerProfileStoreService>;

  beforeEach(async () => {
    storeMock = jasmine.createSpyObj('FarmerProfileStoreService', [
      'farmerDetails$',
      'plots$',
      'fetchFarmerPlots',
      'getFarmerDetails',
      'deletePlot',
    ]);

    storeMock.farmerDetails$ = of(null);

    storeMock.plots$ = of({
      results: [],
      count: 0,
      loading: false,
    });

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
      imports: [FarmComponent, TranslateModule.forRoot(), MatDialogModule],
      providers: [
        {
          provide: FarmerProfileStoreService,
          useValue: storeMock,
        },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch farmer details', () => {
    component.ngOnInit();
    expect(component.apiLoaded).toBeTruthy();
    expect(component.farmList).toEqual([]);
  });

  it('should fetch farmer details data and variable init', () => {
    spyOn(component, 'plotSelected');
    const testSub = new BehaviorSubject(mockPlots);
    storeMock.plots$ = testSub.asObservable();
    component.ngOnInit();
    expect(component.apiLoaded).toBeTruthy();
    expect(component.farmList).toEqual([
      {
        title: 'test',
        description: 'test, India',
        rightIcon: {
          isMatIcon: true,
          icon: 'keyboard_arrow_right',
        },
      },
    ]);

    expect(component.plotArray).toEqual([
      {
        ...mockPlots.results[0],
        address: 'test, India',
      },
    ]);

    expect(component.plotSelected).toHaveBeenCalledWith({
      index: 0,
      item: component.farmList[0],
    });
  });

  it('fetchEverything', () => {
    component.fetchEverything();
    expect(storeMock.fetchFarmerPlots).toHaveBeenCalled();
    expect(storeMock.getFarmerDetails).toHaveBeenCalled();
  });

  describe('plotSelected', () => {
    it('should set markerPositions and center correctly for point location type', () => {
      // Arrange
      const index = 0;
      const latitude = 12.345;
      const longitude = 67.89;
      const locationType = 'APPROXIMATE';
      component.farmList = [{ title: 'test', description: 'test, India' }];
      const plotArray = [
        {
          id: 1,
          latitude,
          longitude,
          location_type: locationType,
        },
      ];
      component.plotArray = plotArray;

      // Act
      component.plotSelected({ index: 0, item: component.farmList[0] });

      // Assert
      expect(component.activeId).toEqual(index);
      expect(component.markerPositions).toEqual([
        { lat: latitude, lng: longitude },
      ]);
      expect(component.center).toEqual({ lat: latitude, lng: longitude });
    });
    it('should call drawPolygon for non-point location types', () => {
      // Arrange
      const index = 0;
      const geoJson =
        '{"type": "Polygon", "coordinates": [[[12.34, 56.78], [12.34, 56.79], [12.35, 56.79], [12.35, 56.78], [12.34, 56.78]]]}';
      const locationType = 'POLYGON';
      component.farmList = [{ title: 'test', description: 'test, India' }];
      const plotArray = [
        {
          id: 1,
          geo_json: geoJson,
          location_type: locationType,
        },
      ];
      component.plotArray = plotArray;
      spyOn(component, 'drawPolygon');

      // Act
      component.plotSelected({ index, item: component.farmList[0] });

      // Assert
      expect(component.drawPolygon).toHaveBeenCalledWith(geoJson);
    });
  });
});

class UtilServiceStub {
  customSnackBar() {
    console.log('hi');
  }
  mapInitialized$ = of(true);
}
