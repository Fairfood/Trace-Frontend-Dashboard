/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// services
import { GlobalStoreService } from 'src/app/shared/store';
import { ConnectionLabelService } from './connection-label.service';
import { UtilService } from 'src/app/shared/service';
// config
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { IMPORTS, LABEL_COLUMNS } from './connection-label.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// component
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';

@Component({
  selector: 'app-connection-label',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatDialogModule, ...IMPORTS],
  templateUrl: './connection-label.component.html',
  styleUrls: ['./connection-label.component.scss'],
})
export class ConnectionLabelComponent {
  memberType = +localStorage.getItem('memberType');
  addScreenVisible = false;
  dataLoading = true;
  connectionLabels: any;
  connectionLabelsCount: number;
  pageApis: Subscription[] = [];
  limit = 10;
  offset = 0;
  availableSupplyChains: any[];

  labelForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    supplyChain: [[''], Validators.required],
    id: [''],
  });

  connectionLabelsDispaly: ITableColumnHeader[];
  submitted: boolean;
  isEdit: boolean;
  currentlyEditing: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private global: GlobalStoreService,
    private service: ConnectionLabelService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    this.getSupplyChains();
    if (this.memberType === 3) {
      LABEL_COLUMNS.pop();
      this.connectionLabelsDispaly = LABEL_COLUMNS;
    } else {
      this.connectionLabelsDispaly = LABEL_COLUMNS;
    }
  }

  toggleAddScreen(): void {
    this.addScreenVisible = !this.addScreenVisible;

    if (this.addScreenVisible) {
      this.labelForm.patchValue({
        label: '',
        supplyChain: null,
      });
      this.labelForm.reset();
    } else {
      this.isEdit = false;
      this.currentlyEditing = null;
    }
  }

  getSupplyChains(): void {
    const api = this.global.supplychainData$.subscribe(res => {
      this.availableSupplyChains = res.map(s => {
        const { id, name } = s;
        return { id, name };
      });
      this.getConnectionLabels();
    });
    this.pageApis.push(api);
  }

  getConnectionLabels(): void {
    this.connectionLabels = [];
    const api = this.service
      .listConnectionLabels(this.limit, this.offset)
      .subscribe((res: any) => {
        const { count, results } = res;
        const labels = results;
        labels.filter((label: any) => {
          const schain: any = [];
          if (label.supply_chains?.length > 2) {
            let i = 1;
            label.supply_chains.filter((supplychain: any) => {
              if (i > 2) {
                schain.push(supplychain.name);
              }
              i++;
            });
            label.supplychains = schain;
          }
        });
        this.connectionLabels = results;
        this.connectionLabelsCount = count;
        this.dataLoading = false;
      });
    this.pageApis.push(api);
  }

  createNewLabel(): void {
    this.submitted = true;
    if (this.labelForm.valid) {
      const { label: name, supplyChain, id } = this.labelForm.value;
      const supply_chains = supplyChain?.map((s: any) => s.id) || [];
      const params = { supply_chains, name };
      if (!this.isEdit) {
        const api = this.service.createConnectionLabel(params).subscribe(
          () => {
            this.addScreenVisible = false;
            this.util.customSnackBar(
              'Label created successfully',
              ACTION_TYPE.SUCCESS
            );
            this.labelForm.reset();
            this.labelForm.patchValue({
              label: '',
              supplyChain: null,
            });
            this.getConnectionLabels();
            this.submitted = false;
          },
          err => {
            console.log(err);
          }
        );
        this.pageApis.push(api);
      } else {
        if (this.currentlyEditing) {
          const result =
            JSON.stringify(this.currentlyEditing.supply_chains) ===
            JSON.stringify(supply_chains);
          if (result) {
            params.supply_chains = supply_chains.map((m: any) => m.id);
          }
        }
        const api = this.service.updateConnectionLabel(id, params).subscribe({
          next: () => {
            this.util.customSnackBar(
              'Label updated successfully',
              ACTION_TYPE.SUCCESS
            );
            this.labelForm.reset();
            this.getConnectionLabels();
            this.addScreenVisible = false;
          },
          error: err => {
            console.log(err);
          },
        });
        this.pageApis.push(api);
      }
    }
  }

  removeConnectionLabel(item: any): void {
    const dialogRef = this.dialog.open(ProfilePopupComponent, {
      width: '30vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        label: item,
        type: 'removeLabel',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const api = this.service
          .removeConnectionLabel(item.id)
          .subscribe(() => {
            const message = 'Connection label removed successfully';
            this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
            this.dataLoading = true;
            this.getConnectionLabels();
          });
        this.pageApis.push(api);
      }
    });
  }

  editStarted(item: any): void {
    this.isEdit = true;
    this.currentlyEditing = item;
    this.labelForm.patchValue({
      id: item.id,
      label: item.name,
      supplyChain: item.supply_chains,
    });
    this.addScreenVisible = true;
  }

  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.limit = limit;
    this.offset = offset;
    this.dataLoading = true;
    this.getConnectionLabels();
  }

  setSupplychain(selectedData: any): void {
    if (typeof selectedData === 'string') {
      this.labelForm.patchValue({
        supplyChain: '',
      });
    } else {
      this.labelForm.patchValue({
        supplyChain: selectedData,
      });
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
