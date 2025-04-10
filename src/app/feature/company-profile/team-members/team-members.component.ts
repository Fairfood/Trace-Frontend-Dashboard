/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
// services
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from 'src/app/shared/service';
import { CompanyProfileStoreService } from '../';
import { TeamMemberService } from './';
// configs
import { ACTION_TYPE, emailRegex } from 'src/app/shared/configs/app.constants';
import { IMPORTS, MEMBER_COLUMNS } from './team-members.config';
import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import { IPaginator } from 'fairfood-utils';
// components
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss'],
  standalone: true,
  imports: [CommonModule, ...IMPORTS],
})
export class TeamMembersComponent implements OnInit, OnDestroy {
  teamMemberForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(emailRegex)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['', Validators.required],
    userId: [''],
  });
  roles: ICommonObj[];
  autoCompleteOptions: any = [];

  teamMembers: any;
  teamMembersCount: any;
  asAdmin: boolean;
  pageApis: Subscription[];
  dataLoading: boolean;
  filterOptions: any;
  addMemberScreenVisible: boolean;
  showAdditional: boolean;
  memberSelected: boolean;
  memberType = +localStorage.getItem('memberType');
  submitted: boolean;
  displayedColumns: ITableColumnHeader[] = MEMBER_COLUMNS;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    public util: UtilService,
    private service: TeamMemberService,
    private store: CompanyProfileStoreService,
    private translate: TranslateService
  ) {
    this.pageApis = [];
    this.filterOptions = {
      search: '',
      limit: 10,
      offset: 0,
    };
    this.roles = service.roleList();
  }

  ngOnInit(): void {
    this.dataLoading = true;
    this.service.listTeamMembers(this.filterOptions);
    this.getTeammembers();
  }

  // Method to get TeamMembers
  getTeammembers() {
    const api = this.store.memberList$.subscribe((res: any) => {
      this.teamMembers = [];
      if (res) {
        const { results, count } = res;
        this.teamMembers = results;
        this.teamMembersCount = count;
        this.dataLoading = false;
      }

      this.isAdmin();
    });
    this.pageApis.push(api);
  }

  // method to check user is Admin or member
  isAdmin(): void {
    const profileDataSub = this.store.profileData$.subscribe({
      next: (res: any) => {
        if (res) {
          const { is_admin } = res;
          this.asAdmin = is_admin;
        }
      },
    });

    this.pageApis.push(profileDataSub);
  }

  reloadMemberList(search?: string): void {
    this.filterOptions = {
      search: search || '',
      limit: 10,
      offset: 0,
    };
    this.store.resetMembers();
    this.dataLoading = true;
    this.service.listTeamMembers(this.filterOptions);
  }

  /**
   * Change the role of members
   * @param member any
   * @param text string
   */
  /* istanbul ignore next */
  changeMemberRole(member: any, text: string): void {
    const dialogRef = this.dialog.open(ProfilePopupComponent, {
      width: '30vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        member,
        type: 'make',
        text,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === false) {
          this.util.customSnackBar(
            this.translate.instant('team.memberRoleFailed'),
            ACTION_TYPE.FAILED
          );
        } else {
          this.util.customSnackBar(
            this.translate.instant('team.memberRole'),
            ACTION_TYPE.SUCCESS
          );
          this.reloadMemberList();
        }
      }
    });
  }

  /* istanbul ignore next */
  resendInvite(member: any): void {
    const formData = new FormData();
    const api = this.service.resendMemberInvite(formData, member.id).subscribe({
      next: () => {
        this.util.customSnackBar(
          this.translate.instant('team.resendInvite'),
          ACTION_TYPE.SUCCESS
        );
      },
      error: () => {
        this.util.customSnackBar(
          this.translate.instant('team.resendInviteFailed'),
          ACTION_TYPE.FAILED
        );
      },
    });
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  openTeammemberDeleteDialog(elem: any): void {
    const dialogRef = this.dialog.open(ProfilePopupComponent, {
      width: '400px',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        member: elem,
        type: 'delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === false) {
          this.util.customSnackBar(
            this.translate.instant('team.teamMemberDeleteFailed'),
            ACTION_TYPE.FAILED
          );
        } else {
          this.util.customSnackBar(
            this.translate.instant('team.teamMemberDelete'),
            ACTION_TYPE.SUCCESS
          );
          this.reloadMemberList();
        }
      }
    });
  }

  toggleAddMember(): void {
    this.addMemberScreenVisible = !this.addMemberScreenVisible;
    if (this.addMemberScreenVisible) {
      this.initSearchEmail();
    } else {
      this.teamMemberForm.reset();
      this.teamMemberForm.patchValue({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        userId: '',
      });
    }
  }

  /* istanbul ignore next */
  initSearchEmail(): void {
    const { email } = this.teamMemberForm.controls;
    const api = email.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(emailValue => {
        if (email.valid) {
          const api2 = this.service
            .searchEmail(emailValue)
            .subscribe((result: any) => {
              this.autoCompleteOptions = result;
              this.showAdditional = true;
              this.teamMemberForm.controls.email.setErrors(null);
            });
          this.pageApis.push(api2);
        } else {
          this.showAdditional = false;
          this.autoCompleteOptions = [];
        }
      });
    this.pageApis.push(api);
  }

  optionsSelected(item: any): void {
    const selected = item.option.value;
    const found = this.autoCompleteOptions.find(
      (f: any) => f.email === selected
    );
    this.memberSelected = true;
    this.teamMemberForm.patchValue({
      firstName: found.first_name ?? '',
      lastName: found.last_name ?? '',
      userId: found.id,
    });
  }

  /**
   * Role selected from dropdown
   * @param data any
   */
  roleSelected(data: any): void {
    if (data.id !== 'All') {
      this.teamMemberForm.patchValue({
        role: data.id,
      });
    } else {
      this.teamMemberForm.patchValue({
        role: '',
      });
    }
  }

  // method to add/invite team member
  addTeamMember(): void {
    if (this.teamMemberForm.valid) {
      this.dataLoading = true;
      this.submitted = true;
      const formData = new FormData();
      const { email, firstName, lastName, userId, role } =
        this.teamMemberForm.value;
      if (this.memberSelected) {
        formData.append('user', userId);
        formData.append('type', role);
      } else {
        formData.append('email', email);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('type', role);
      }
      const api = this.service.addTeam(formData).subscribe({
        next: () => {
          this.store.resetMembers();
          this.util.customSnackBar(
            this.translate.instant('team.teamMemberAdd'),
            ACTION_TYPE.SUCCESS
          );
          this.toggleAddMember();
          this.reloadMemberList();
        },
        error: (err: any) => {
          this.dataLoading = false;
          if (err.error.code === 400) {
            this.teamMemberForm.controls.email.setErrors({ incorrect: true });
          }
        },
      });
      this.pageApis.push(api);
    } else {
      this.util.customSnackBar(
        this.translate.instant('formValidation.required'),
        ACTION_TYPE.FAILED
      );
    }
  }

  searchFilter(searchText: string): void {
    this.reloadMemberList(searchText);
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.filterOptions.limit = limit;
    this.filterOptions.offset = offset;
    this.store.resetMembers();
    this.dataLoading = true;
    this.service.listTeamMembers(this.filterOptions);
  }

  /* istanbul ignore next */
  trackByFn(index: number): any {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
