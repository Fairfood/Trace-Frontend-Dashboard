/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseStoreService } from 'src/app/shared/store/base-store.service';

interface CompanyDataState {
  profileData: any;
  teamMembers: any[];
}

const initialState: CompanyDataState = {
  profileData: null,
  teamMembers: [],
};

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileStoreService extends BaseStoreService<CompanyDataState> {
  profileData$: Observable<any[]> = this.select((state: CompanyDataState) => {
    return state.profileData;
  });

  memberList$: Observable<any[]> = this.select((state: CompanyDataState) => {
    return state.teamMembers;
  });

  constructor() {
    super(initialState);
  }

  updateProfileData(data: any): void {
    this.setState({
      profileData: data,
    });
  }

  resetProfile(): void {
    this.updateProfileData(null);
  }

  updateMemberData(data: any): void {
    this.setState({
      teamMembers: data,
    });
  }

  resetMembers(): void {
    this.updateMemberData([]);
  }
}
