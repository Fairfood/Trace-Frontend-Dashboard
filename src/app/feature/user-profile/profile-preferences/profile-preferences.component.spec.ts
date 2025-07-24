import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ProfilePreferencesComponent } from './profile-preferences.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

describe('ProfilePreferencesComponent', () => {
  let component: ProfilePreferencesComponent;
  let fixture: ComponentFixture<ProfilePreferencesComponent>;

  beforeEach(async () => {
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ProfilePreferencesComponent,
        MatSnackBarModule,
        HttpClientModule,
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
