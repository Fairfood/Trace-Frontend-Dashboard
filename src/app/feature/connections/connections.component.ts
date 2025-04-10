/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService, UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent {
  toggleHelp: boolean;
  listView: boolean;
  linkNavigate = false;
  linkConnect = false;
  externalId$: Observable<boolean>;

  private utilService = inject(UtilService);
  private storage = inject(StorageService);

  constructor() {
    this.externalId$ = this.utilService.externalId;
    this.linkNavigate =
      this.storage.retrieveStoredData('link_navigate') === 'true';
    this.linkConnect =
      this.storage.retrieveStoredData('link_connect') === 'true';
  }

  showHideHelp(): void {
    this.toggleHelp = !this.toggleHelp;
  }

  onToggleConnectionView(listView: any): void {
    this.listView = listView?.target?.checked;
  }
}
