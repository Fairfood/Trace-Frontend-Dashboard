/* istanbul ignore file */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GlobalStoreService } from 'src/app/shared/store';
import { IUserData } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-profile-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-preferences.component.html',
  styleUrls: ['./profile-preferences.component.scss'],
})
export class ProfilePreferencesComponent {
  sub: Subscription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companyList: any[] = [];
  loading = true;

  constructor(private global: GlobalStoreService) {}

  ngOnInit(): void {
    this.sub = this.global.userData$.subscribe((data: IUserData) => {
      if (data) {
        const { nodes } = data;
        this.companyList = nodes.map(node => {
          return {
            ...node,
            selected: false,
          };
        });
        this.loading = false;
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleCompanySettings(event: any, company: any): void {
    company.selected = event.target.checked;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectAllCompany(event: any): void {
    this.companyList.forEach(company => {
      company.selected = event.target.checked;
    });
  }
}
