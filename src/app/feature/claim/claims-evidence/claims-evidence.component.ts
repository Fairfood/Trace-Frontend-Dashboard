/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-claims-evidence',
  templateUrl: './claims-evidence.component.html',
  styleUrls: ['./claims-evidence.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
})
export class ClaimsEvidenceComponent implements OnInit {
  table: boolean;

  constructor(
    public dialogRef: MatDialogRef<ClaimsEvidenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.checkFilesIncluded();
  }

  close(): void {
    this.dialogRef.close();
  }

  viewFile(field: any): void {
    window.open(field.field_response.file, '_blank');
  }

  checkFilesIncluded(): void {
    this.data.map((responseData: any) => {
      responseData?.node_responses?.map((e: any) => {
        e.responses.map((f: any) => {
          if (f.field_response.type == 3) {
            responseData.table = true;
          }
        });
      });
    });
  }
}
