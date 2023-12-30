/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
// service
import { UtilService } from '../../service';
// material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
  ],
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  @Input() placeholder: string;
  @Input() searchByOptions: any[];
  @Input() hideOptions: boolean;
  @Input() clearSearch = false; // New input to trigger search string clearing

  @Output() searchText = new EventEmitter();

  keyword: string;
  sub: Subscription[] = [];
  supplyChainId = localStorage.getItem('supplyChainId');
  searchByOption: any;
  keywordControl: FormControl = new FormControl('');

  constructor(private _dataService: UtilService) {}

  ngOnInit(): void {
    const supplyChainIdSub = this._dataService.supplyChainData$.subscribe(
      (res: any) => {
        if (res && res !== this.supplyChainId) {
          this.keyword = '';
        }
      }
    );
    this.sub.push(supplyChainIdSub);

    const inputChanges = this.keywordControl.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe((value: string) => {
        if (!this.clearSearch) {
          // Check if clearSearch is false before emitting search text
          this.searchText.emit(value);
        }
      });

    this.sub.push(inputChanges);

    if (!this.hideOptions) {
      this.searchByOption = this.searchByOptions[0];
    }
  }

  ngOnChanges(): void {
    if (this.clearSearch) {
      this.keywordControl.setValue('');
    }
  }

  ngOnDestroy(): void {
    this.sub.forEach((s: any) => s.unsubscribe());
  }
}
