import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfilePopupComponent } from './profile-popup.component';
import { TeamMemberService } from '../team-members';
import { Subscription, of } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';

describe('ProfilePopupComponent', () => {
  let component: ProfilePopupComponent;
  let fixture: ComponentFixture<ProfilePopupComponent>;

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
      imports: [ProfilePopupComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TeamMemberService, useClass: TeamMemberServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class TeamMemberServiceStub {
  updateRole(id: number, type: number) {
    return new Subscription();
  }

  removeMember(id: number) {
    return new Subscription();
  }
}
