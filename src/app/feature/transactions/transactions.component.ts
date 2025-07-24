/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';

// models
import { TR_IMPORTS } from './transactions.config';
import { TransactionsCommonComponent } from './transactions-common/transactions-common.component';
import { NavigationStart } from '@angular/router';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: true,
  imports: [TR_IMPORTS],
})
export class TransactionsComponent
  extends TransactionsCommonComponent
  implements OnInit, OnDestroy
{
  type = 'transactions-list';

  /* istanbul ignore next */
  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event instanceof NavigationStart) {
        const nextRoute = event.url;
        if (
          nextRoute !== '/transactions' &&
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
   * The function `goToArchive` navigates to the 'archive-transactions' route using an array in
   * TypeScript.
   */
  /* istanbul ignore next */
  goToArchive(): void {
    this.trService.resetPaginationState();
    this.trService.resetPaginationStateInternal();
    this.routeService.navigateArray(['archive-transactions']);
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
