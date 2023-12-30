/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartEvent } from 'chart.js';
@Component({
  selector: 'app-chart-donut',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './chart-donut.component.html',
  styleUrls: ['./chart-donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDonutComponent implements OnChanges {
  @Input() chartData: any;
  @Input() hideLegend: boolean;

  doughnutChartData: any;

  ngOnChanges(changes: SimpleChanges): void {
    const { chartData } = changes;
    const { labels, values, colors } = chartData.currentValue;
    this.doughnutChartData = {
      labels,
      datasets: [
        { data: values, backgroundColor: colors, cutoutPercentage: 40 },
      ],
    };
  }

  // events
  chartClicked({ event, active }: { event: ChartEvent; active: any[] }): void {
    console.log(event, active);
  }

  chartHovered({ event, active }: { event: ChartEvent; active: any[] }): void {
    console.log(event, active);
  }
}
