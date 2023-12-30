import { Component, OnInit } from '@angular/core';
import { BatchSummary, StepValues } from '../process-stock.config';
import { StockProcessService } from '../stock-process.service';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
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
  }
}
