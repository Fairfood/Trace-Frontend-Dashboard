import {
  TestBed,
  ComponentFixture,
  tick,
  fakeAsync,
} from '@angular/core/testing';
import { DownloadsComponent } from './downloads.component';
import { HttpClientModule } from '@angular/common/http';
import { ExportService, UtilService } from 'src/app/shared/service';
import { BehaviorSubject, of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DownloadsComponent', () => {
  let component: DownloadsComponent;
  let fixture: ComponentFixture<DownloadsComponent>;
  let exportService: ExportService;

  beforeEach(async () => {
    const utilServiceMock = {
      companyData$: new BehaviorSubject(null),
      customSnackBar(): void {
        console.log('hi');
      },
    };
    await TestBed.configureTestingModule({
      imports: [
        DownloadsComponent,
        HttpClientModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: UtilService, useValue: utilServiceMock },
        ExportService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadsComponent);
    component = fixture.componentInstance;
    exportService = TestBed.inject(ExportService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call exportService.createExport and update recentExports array', fakeAsync(() => {
    const mockExportData = {};
    const mockApiResponse = { id: 'mockId', status: 'preparing', etc: 100 };
    spyOn(exportService, 'createExport').and.returnValue(of(mockApiResponse));
    component.exportData(mockExportData);
    expect(exportService.createExport).toHaveBeenCalledWith(mockExportData);
    tick(3000);
    expect(component.recentExports.length).toBe(1);
    expect(component.recentExports[0].id).toBe('mockId');
    expect(component.recentExports[0].status).toBe('preparing');
  }));
});
