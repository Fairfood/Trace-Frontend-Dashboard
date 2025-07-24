/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
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
export class SearchBoxComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef;
  @Input() placeholder: string;
  @Input() searchByOptions: any[];
  @Input() hideOptions: boolean;
  @Input() clearSearch = false; // New input to trigger search string clearing
  @Input() searchString: string;
  @Input() autoFocus = false;
  @Input() selectedOption = '';

  @Output() searchText = new EventEmitter();
  @Output() searchByOptionChange = new EventEmitter<any>();

  keyword: string;
  sub: Subscription[] = [];
  supplyChainId = localStorage.getItem('supplyChainId');
  searchByOption: any;
  keywordControl: FormControl = new FormControl('');

  constructor(private _dataService: UtilService) {}

  ngOnInit(): void {
    let isFirstChange = true;
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
        if (!this.clearSearch && !isFirstChange) {
          this.searchText.emit(value);
        }
        isFirstChange = false;
      });

    this.sub.push(inputChanges);

    if (!this.hideOptions) {
      this.searchByOption =
        this.searchByOptions.find(opt => opt.id === this.selectedOption) ||
        this.searchByOptions[0];

      // this.searchByOption = this.searchByOptions[0];
    }
    this.keyword = this.searchString;
    this.keywordControl.setValue(this.searchString, { emitEvent: false });
  }

  ngOnChanges(): void {
    if (this.clearSearch) {
      this.keywordControl.setValue('');
    }
  }

  ngAfterViewInit(): void {
    if (this.autoFocus) {
      setTimeout(() => {
        this.searchInputRef?.nativeElement?.focus();
      });
    }
  }

  onOptionSelect(option: any): void {
    this.searchByOption = option;
    this.searchByOptionChange.emit(option); // Emit the selected option
  }

  ngOnDestroy(): void {
    this.sub.forEach((s: any) => s.unsubscribe());
  }
}
