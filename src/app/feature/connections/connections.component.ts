/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent {
  toggleHelp: boolean;
  listView: boolean;

  showHideHelp(): void {
    this.toggleHelp = !this.toggleHelp;
  }

  onToggleConnectionView(listView: any): void {
    this.listView = listView?.target?.checked;
  }
}
