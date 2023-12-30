/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { TeamMemberService } from '../team-members/team-member.service';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, ButtonsComponent, MatIconModule],
})
export class ProfilePopupComponent {
  pageApis: Subscription[] = [];
  constructor(
    public dialogRef: MatDialogRef<ProfilePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private memberService: TeamMemberService
  ) {}

  actionButton(): void {
    const { text, member } = this.data;
    if (this.data?.type === 'make') {
      const type = text === 'admin' ? 1 : text === 'member' ? 2 : 3;
      const api = this.memberService
        .updateRole(member?.id, type)
        .subscribe(res => {
          if (res.success) {
            this.dialogRef.close(true);
          } else {
            this.dialogRef.close(false);
          }
        });
      this.pageApis.push(api);
    }
    // else if (this.data?.type === 'deleteDoc') {
    //   const api = this.companyService.deleteDoc(file).subscribe(res => {
    //     if (res.success) {
    //       this.dialogRef.close(true);
    //     } else {
    //       this.dialogRef.close(false);
    //     }
    //   });
    //   this.pageApis.push(api);
    // } else if (
    //   this.data?.type === 'deleteTemplate' ||
    //   this.data?.type === 'removeLabel' ||
    //   this.data?.type === 'removeClaim'
    // ) {
    //   this.dialogRef.close(true);
    // }
    else {
      const api = this.memberService.removeMember(member?.id).subscribe(res => {
        if (res.success) {
          this.dialogRef.close(true);
        } else {
          this.dialogRef.close(false);
        }
      });
      this.pageApis.push(api);
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }
}
