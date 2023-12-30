/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

// config
import { CLAIM_IMPORTS } from './claim-detail.config';
import { ICommonObj } from 'src/app/shared/configs/app.model';
// services
import { ClaimService } from '../claim.service';

const EXTERNAL_VERIFIER = 2;

/**
 * Popup component for showing claim detail
 * Edit claim
 * update_log: It was a part of process stock module. Changed it into a different module
 */
@Component({
  selector: 'app-claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.scss'],
  standalone: true,
  imports: [...CLAIM_IMPORTS],
})
export class ClaimDetailComponent implements OnInit {
  verifierFilterOptions: Observable<any>;
  verifierControl: FormControl = new FormControl('', [Validators.required]);
  verifierError: boolean;
  evidenceForm: FormGroup;
  savedData: Record<string, any>;
  constructor(
    public dialogRef: MatDialogRef<ClaimDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private claimService: ClaimService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const formObj: any = {};
    if (this.data.verified_by === EXTERNAL_VERIFIER) {
      formObj['verifier'] = [
        this.data.isEdit ? this.data.verifier.name : '',
        Validators.required,
      ];
      formObj['verifierObj'] = [
        this.data.isEdit ? this.data.verifier : '',
        Validators.required,
      ];
    }
    this.setCriteriaForm(formObj);
    if (this.data.verified_by === EXTERNAL_VERIFIER) {
      this.initVerifierAutoComplete();
    }
    if (this.data.isEdit) {
      this.evidenceForm.updateValueAndValidity();
      this.savedData = JSON.parse(JSON.stringify(this.data));
    }
  }

  /* istanbul ignore next */
  initVerifierAutoComplete(): void {
    this.verifierFilterOptions =
      this.evidenceForm.controls.verifier.valueChanges.pipe(
        debounceTime(600),
        distinctUntilChanged(),
        startWith(this.evidenceForm.controls.verifier.value),
        map(val => val ?? ''),
        switchMap((value: string) => {
          if (value !== this.evidenceForm.controls.verifierObj?.value?.name) {
            this.evidenceForm.controls.verifierObj.setValue(null);
          }
          return this.getVeriferList(value);
        })
      );
  }

  /* istanbul ignore next */
  setCriteriaForm(formObj: any): void {
    this.data?.criteria?.map((criteria: any) => {
      if (criteria.fields.length) {
        this.setFieldsInForm(criteria.fields, formObj);
      } else {
        console.log('No form created');
      }
    });

    this.evidenceForm = this.fb.group(formObj);
  }

  /* istanbul ignore next */
  setFieldsInForm(fields: any[], formObj: any): void {
    fields.forEach((field: any) => {
      const { type, file, value } = field;
      let controlValue = '';
      if (this.data.isEdit) {
        if (type === 3 && file) {
          controlValue = value;
        }
        if (type === 2 && value) {
          controlValue = value;
        }
        if (type === 1 && value) {
          controlValue = value;
        }
      }

      formObj[field.id] = [controlValue, Validators.required];
    });
  }

  /* istanbul ignore next */
  getVeriferList(event: string) {
    return this.claimService.getVerifiers(this.data.id, event);
  }

  setVerifier(value: any): void {
    this.data.verifier = value;
    this.data.verifierAssigned = true;
    this.evidenceForm.controls.verifierObj?.setValue(value);
  }

  /* istanbul ignore next */
  close(): void {
    if (this.data.isEdit) {
      this.data = this.savedData;
    } else {
      this.dataResetIfAny();
    }
    this.dialogRef.close();
  }

  /* istanbul ignore next */
  dataResetIfAny(): void {
    this.data.criteria?.map((criteria: any) => {
      criteria.fields.map((field: any) => {
        field.value = null;
        field.file = false;
      });
    });
    this.data.verifierAssigned = false;
    this.data.verifier = null;
  }

  // method to view inheritable claims data (file)
  /* istanbul ignore next */
  viewFiles(field: any): void {
    // const dialogRef = this.dialog.open(ClaimsEvidenceComponent, {
    //   disableClose: true,
    //   width: '750px',
    //   height: 'auto',
    //   data: field,
    //   panelClass: 'custom-modalbox',
    // });
  }

  /**
   * Uploading evidence files
   */
  /* istanbul ignore next */
  claimsFile(file: any, item: any): void {
    item.file = true;
    item.fileName = file.target.files[0].name;
    // using in the api call
    const params = {
      transaction: '',
      field: item.id,
      file: file.target.files[0],
      selected: item.file,
    };
    this.evidenceForm.controls[item.id].setValue(params);
    item.value = params;
  }

  /* istanbul ignore next */
  removeClaimFile(field: any): void {
    field.file = false;
    delete field.value;
    delete field.fileName;
    this.evidenceForm.controls[field.id].setValue(null);
  }

  /**
   * if the claim evidence field type is dropdown
   * @param newValue any
   * @param field any
   */
  /* istanbul ignore next */
  setDropdownValue(newValue: ICommonObj, field: any): void {
    const selectedFilterValue = newValue.id === 'All' ? '' : newValue.name;
    field.value = selectedFilterValue;
    this.evidenceForm.controls[field.id].setValue(selectedFilterValue);
  }

  /* istanbul ignore next */
  setInputTypes(field: any): void {
    field.value = this.evidenceForm.controls[field.id].value;
  }

  /* istanbul ignore next */
  claimValidation(): void {
    if (this.evidenceForm.valid) {
      this.data.selected = true;
      this.dialogRef.close(this.data);
    }
  }
}
