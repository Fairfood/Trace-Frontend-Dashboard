/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
// material
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
// component
import { ButtonsComponent } from 'fairfood-utils';
// services
import { ListViewService } from '../list-view/list-view.service';

/**
 * Component for connection type selection dialog.
 */
@Component({
  selector: 'app-connection-type-selection',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    ReactiveFormsModule,
    ButtonsComponent,
  ],
  templateUrl: './connection-type-selection.component.html',
  styleUrls: ['./connection-type-selection.component.scss'],
})
export class ConnectionTypeSelectionComponent {
  connectionType = new FormControl('1');
  /**
   * Constructor of the component.
   * @param dialogRef - Reference to the dialog.
   * @param data - Data injected into the dialog.
   * @param router - Router service.
   * @param listService - List view service.
   * @param storage - Storage service.
   */
  constructor(
    private dialogRef: MatDialogRef<ConnectionTypeSelectionComponent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) private data: any,
    private listService: ListViewService
  ) {}

  /** Closes the dialog. */
  close(): void {
    this.dialogRef.close();
  }

  /** Constructs data based on the selected connection type. */
  constructData(): void {
    const { tier } = this.data;
    if (tier === 1) {
      this.addSuppliers();
    } else {
      this.myCompany();
    }
  }

  /** Adds suppliers based on the selected connection type. */
  addSuppliers(): void {
    const { id, name } = this.data;
    if (+this.connectionType.value === 1) {
      this.listService.addCompanyPopup({
        connectionType: 'supplier',
        id,
        full_name: name,
      });
    } else {
      this.listService.farmerConnection({ id, full_name: name });
    }
  }

  /** Handles the connection for the current company. */
  myCompany() {
    if (+this.connectionType.value === 1) {
      this.listService.addNewConnection();
    } else {
      this.listService.farmerConnection();
    }
  }

  /** Initiates a new connection based on the selected connection type. */
  newConnection() {
    this.close();
    this.constructData();
  }
}
