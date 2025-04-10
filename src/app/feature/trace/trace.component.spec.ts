import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TraceComponent } from './trace.component';
import { TraceStoreService } from './trace-store.service';
import { HttpClientModule } from '@angular/common/http';

describe('TraceComponent', () => {
  let component: TraceComponent;
  let fixture: ComponentFixture<TraceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, TraceComponent],
      providers: [TraceStoreService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
