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
import { TranslateModule } from '@ngx-translate/core';

import { TeamMemberService } from '../team-members';
import { ButtonsComponent } from 'fairfood-utils';
import { DocumentationService } from '../documentation/documentation.service';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ButtonsComponent,
    MatIconModule,
    TranslateModule,
  ],
})
export class ProfilePopupComponent {
  pageApis: Subscription[] = [];
  constructor(
    public dialogRef: MatDialogRef<ProfilePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private memberService: TeamMemberService,
    private docService: DocumentationService
  ) {}

  actionButton(): void {
    if (this.data?.type === 'make') {
      const {
        text,
        member: { id },
      } = this.data;
      this.makeAsAMember(id, text);
    } else if (this.data?.type === 'deleteDoc') {
      const { id } = this.data?.file || {};
      const api = this.docService.deleteDoc(id).subscribe(res => {
        if (res.success) {
          this.dialogRef.close(true);
        } else {
          this.dialogRef.close(false);
        }
      });
      this.pageApis.push(api);
    } else if (
      this.data?.type === 'deleteTemplate' ||
      this.data?.type === 'removeLabel' ||
      this.data?.type === 'removeClaim'
    ) {
      this.dialogRef.close(true);
    } else {
      const {
        text,
        member: { id },
      } = this.data;
      this.removeMember(id);
    }
  }

  makeAsAMember(id: string, text: string): void {
    const textCondition = text === 'member' ? 2 : 3;
    const type = text === 'admin' ? 1 : textCondition;
    const api = this.memberService.updateRole(id, type).subscribe(res => {
      if (res.success) {
        this.dialogRef.close(true);
      } else {
        this.dialogRef.close(false);
      }
    });
    this.pageApis.push(api);
  }

  removeMember(id: string): void {
    const api = this.memberService.removeMember(id).subscribe(res => {
      if (res.success) {
        this.dialogRef.close(true);
      } else {
        this.dialogRef.close(false);
      }
    });
    this.pageApis.push(api);
  }

  closePopup(): void {
    this.dialogRef.close();
  }
}
