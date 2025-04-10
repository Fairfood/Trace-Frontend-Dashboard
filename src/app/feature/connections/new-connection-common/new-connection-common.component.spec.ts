import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NewConnectionCommonComponent } from './new-connection-common.component';
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

describe('NewConnectionCommonComponent', () => {
  let component: NewConnectionCommonComponent;
  let fixture: ComponentFixture<NewConnectionCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NewConnectionCommonComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatSnackBarModule,
        HttpClientModule,
      ],
      providers: [UtilService, GlobalStoreService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConnectionCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
