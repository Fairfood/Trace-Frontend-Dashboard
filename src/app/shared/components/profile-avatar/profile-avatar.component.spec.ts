import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileAvatarComponent } from './profile-avatar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UtilService } from '../../service';
import { TranslateService } from '@ngx-translate/core';

describe('ProfileAvatarComponent', () => {
  let component: ProfileAvatarComponent;
  let fixture: ComponentFixture<ProfileAvatarComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
    const utilSpyObj = jasmine.createSpyObj('UtilService', [
      'generateTotpToken',
      'customSnackBar',
    ]);
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    TestBed.configureTestingModule({
      imports: [
        ProfileAvatarComponent,
        CommonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpyObj },
        {
          provide: UtilService,
          useValue: utilSpyObj,
        },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
        { provide: MatDialog, useValue: dialogSpyObj },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.imageUrl = 'https://www.google.com';
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
