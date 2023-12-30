import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * Component representing the main layout of the application.
 */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  collapedSideBar: boolean;
  viewingAsAdmin: boolean;
  companyName: string;
  loader = true;

  ngOnInit() {
    const impersonate = localStorage.getItem('impersonate');
    this.viewingAsAdmin = impersonate === 'true';
    if (this.viewingAsAdmin) {
      const userData = JSON.parse(localStorage.getItem('userData'));
      this.companyName = userData.name;
    }
  }

  /**
   * Event handler for receiving collapsed sidebar status.
   * @param $event - Event data indicating whether the sidebar is collapsed or not.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiveCollapsed($event: any) {
    this.collapedSideBar = $event;
  }

  /**
   * Handles the loading status changes.
   * @param status - The loading status ('started' or 'completed').
   */
  loadingStatus(status: string): void {
    if (status === 'started') {
      this.loader = true;
    } else {
      this.loader = false;
    }
  }

  /**
   * Navigates back to the admin view, clearing the local storage.
   */
  backtoAdmin(): void {
    localStorage.clear();
    window.location.href = environment.adminUrl + '?isClearStorage=true';
  }
}
