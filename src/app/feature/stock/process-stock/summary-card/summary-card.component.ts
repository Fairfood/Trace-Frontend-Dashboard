import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BatchSummary, StepValues } from '../process-stock.config';
import { StockProcessService } from '../stock-process.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatMenuModule],
})
export class SummaryCardComponent implements OnInit {
  summaryData: BatchSummary;
  readonly StepValues = StepValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  claims: any[] = [];
  currentAction: string;
  constructor(private processService: StockProcessService) {}

  ngOnInit(): void {
    this.summaryData = this.processService.getSummaryData();
    if (this.processService.fetchCurrentUrl() === '/stock/process-convert') {
      this.currentAction = 'convert';
    } else if (this.processService.fetchCurrentUrl() === '/stock/stock-send') {
      this.currentAction = 'send';
    } else {
      this.currentAction = 'receive';
    }
    if (this.summaryData) {
      const { requestedData } = this.summaryData;
      if (requestedData?.claims.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.claims = requestedData.claims.map((c: any) => c.name);
      }
    }
    this.summaryData.products = [...new Set(this.summaryData?.products)];
  }

  /* istanbul ignore next */
  trackByFn(index: number): number {
    return index;
  }
}
