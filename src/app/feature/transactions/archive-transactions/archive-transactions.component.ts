import { Component, OnDestroy, OnInit } from '@angular/core';
import { TR_IMPORTS } from '../transactions.config';
import { TransactionsCommonComponent } from '../transactions-common/transactions-common.component';
import { NavigationStart } from '@angular/router';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-archive-transactions',
  standalone: true,
  templateUrl: './archive-transactions.component.html',
  styleUrls: ['./archive-transactions.component.scss'],
  imports: [TR_IMPORTS],
})
export class ArchiveTransactionsComponent
  extends TransactionsCommonComponent
  implements OnInit, OnDestroy
{
  type = 'archived';
  /* istanbul ignore next */
  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event instanceof NavigationStart) {
        const nextRoute = event.url;
        if (
          nextRoute !== '/archive-transactions' &&
          !nextRoute.startsWith('/transaction-report/')
        ) {
          this.trService.resetPaginationState();
          this.trService.resetPaginationStateInternal();
          this.trService.transactionType = 'external';
        }
        if (nextRoute.startsWith('/transaction-report/internal/')) {
          this.trService.transactionType = 'internal';
        } else {
          this.trService.transactionType = 'external';
        }
      }
    });

    this.initCalls(this.type);
    const api = this.utils.supplyChainData$.subscribe(res => {
      if (res) {
        this.initCalls(this.type);
      }
    });
    this.pageApis.push(api);

    const exportClicked = this.trService.exportIconClicked().subscribe(res => {
      if (res) {
        this.exportData();
      }
    });
    this.pageApis.push(exportClicked);
  }

  /**
   * The function `goToTransactions` navigates to the 'transactions' route using an array parameter.
   */
  goToTransactions(): void {
    this.routeService.navigateArray(['transactions']);
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
