import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamMembersComponent } from './team-members.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  TranslateService,
  TranslateModule,
  LangChangeEvent,
} from '@ngx-translate/core';
import { UtilService } from 'src/app/shared/service';
import { TeamMemberService } from './';
import { CompanyProfileStoreService } from '../company-profile-store.service';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';

describe('TeamMembersComponent', () => {
  let component: TeamMembersComponent;
  let fixture: ComponentFixture<TeamMembersComponent>;
  let service: TeamMemberService;
  beforeEach(async () => {
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
      imports: [
        TeamMembersComponent,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: TeamMemberService, useClass: TeamMemberServiceStub },
        {
          provide: CompanyProfileStoreService,
          useClass: CompanyProfileStoreServiceStub,
        },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(TeamMemberService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and subscription arrays', () => {
    expect(component.teamMemberForm).toBeDefined();
    expect(component.pageApis).toBeDefined();
  });

  it('should load team members on ngOnInit', () => {
    spyOn(component, 'getTeammembers');
    spyOn(service, 'listTeamMembers');
    component.filterOptions = {
      limit: 10,
      offset: 0,
      search: '',
    };
    component.ngOnInit();
    expect(component.getTeammembers).toHaveBeenCalled();
    expect(service.listTeamMembers).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
      search: '',
    });
  });

  it('should call service method to list team members and set data on successful response', () => {
    spyOn(component, 'isAdmin');

    component.getTeammembers();

    expect(component.isAdmin).toHaveBeenCalled();
    expect(component.teamMembersCount).toEqual(0);
  });

  it('should reload team member list with provided search text', () => {
    const searchText = 'John';
    spyOn(component, 'reloadMemberList');
    component.searchFilter(searchText);
    expect(component.reloadMemberList).toHaveBeenCalledWith(searchText);
  });

  it('should update filter options and reload member list on paginatorEvent', () => {
    const filterOptions = {
      search: '',
      limit: 10,
      offset: 10,
    };

    const newPaginatorData = { limit: 20, offset: 0, search: '' };
    spyOn(service, 'listTeamMembers');
    component.filterOptions = filterOptions;
    component.paginatorEvent(newPaginatorData);
    expect(component.filterOptions).toEqual(newPaginatorData);
    expect(service.listTeamMembers).toHaveBeenCalled();
  });

  it('should toggle add member screen and initialize search email when called', () => {
    spyOn(component, 'initSearchEmail');
    component.toggleAddMember();
    expect(component.addMemberScreenVisible).toBeTrue();
    expect(component.initSearchEmail).toHaveBeenCalled();

    component.toggleAddMember();
    expect(component.addMemberScreenVisible).toBeFalse();
  });

  it('should select options from autocomplete and update form values', () => {
    const item = { option: { value: 'test@example.com' } };
    component.autoCompleteOptions = [
      {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        id: 1,
      },
    ];
    component.optionsSelected(item);
    expect(component.memberSelected).toBeTrue();
    expect(component.teamMemberForm.value).toEqual({
      email: '',
      firstName: 'John',
      lastName: 'Doe',
      role: '',
      userId: 1,
    });
  });

  it('should select role from dropdown and update form value', () => {
    const data = { id: 'role-id' };
    component.roleSelected(data);
    expect(component.teamMemberForm.get('role').value).toEqual('role-id');

    component.roleSelected({ id: 'All' });
    expect(component.teamMemberForm.get('role').value).toEqual('');
  });

  it('should add team member with valid form data and reset form on success', () => {
    spyOn(component, 'reloadMemberList');
    spyOn(component.util, 'customSnackBar');

    component.teamMemberForm.patchValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'role-id',
      userId: null,
    });

    spyOn(service, 'addTeam').and.returnValue(of({}));
    component.addTeamMember();
    expect(component.submitted).toBeTrue();
    expect(service.addTeam).toHaveBeenCalled();
    expect(component.reloadMemberList).toHaveBeenCalled();
    expect(component.util.customSnackBar).toHaveBeenCalledWith(
      'team.teamMemberAdd',
      'success'
    );
  });

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    spyOn(component.pageApis[0], 'unsubscribe');
    spyOn(component.pageApis[1], 'unsubscribe');

    component.ngOnDestroy();
    expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
    expect(component.pageApis[1].unsubscribe).toHaveBeenCalled();
  });

  it('should show error message when adding team member fails', () => {
    spyOn(component.util, 'customSnackBar');
    spyOn(service, 'addTeam').and.returnValue(of({}));
    spyOn(console, 'error');

    component.addTeamMember();
    expect(component.util.customSnackBar).toHaveBeenCalledWith(
      'formValidation.required',
      'error'
    );
  });

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    spyOn(component.pageApis[0], 'unsubscribe');
    spyOn(component.pageApis[1], 'unsubscribe');

    component.ngOnDestroy();
    expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
    expect(component.pageApis[1].unsubscribe).toHaveBeenCalled();
  });
});

class UtilServiceStub {
  supplyChainData$ = new Subject<string>();
  customSnackBar(message: string, actionType: string) {
    console.log(
      `Custom snackbar called with message: ${message}, actionType: ${actionType}`
    );
  }
}

class TeamMemberServiceStub {
  listTeamMembers(filterOptions: any): Observable<any> {
    return of({});
  }

  searchEmail(emailValue: string): Observable<any> {
    return of([]);
  }

  resendMemberInvite(formData: FormData, memberId: string): Observable<any> {
    return of({});
  }

  addTeam(formData: FormData): Observable<any> {
    return of({});
  }

  roleList(): any[] {
    return [];
  }
}

class CompanyProfileStoreServiceStub {
  profileData$ = new BehaviorSubject<any>(null);
  memberList$ = new BehaviorSubject<any>({ results: [], count: 0 });

  updateProfileData(data: any): void {
    this.profileData$.next(data);
  }

  resetProfile(): void {
    this.profileData$.next(null);
  }

  updateMemberData(data: any[]): void {
    this.memberList$.next(data);
  }

  resetMembers(): void {
    this.memberList$.next([]);
  }
}
