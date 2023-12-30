/* istanbul ignore file */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../service/export.service';

@Component({
  selector: 'app-export-icon',
  templateUrl: './export-icon.component.html',
  styleUrls: ['./export-icon.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ExportIconComponent {
  exportText = 'Export';

  constructor(private service: ExportService) {}
  /**
   *
   * Initiates the export action by updating the exportText
   * and emitting an event through ExportService
   * @returns void
   */
  exportListing(): void {
    if (this.exportText !== 'Exporting') {
      this.exportText = 'Exporting';
      this.service.exportIconClicked$.next(true);
      setTimeout(() => {
        this.exportText = 'Export';
      }, 4000);
    }
  }
}
