import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyProfileStoreService } from '../company-profile-store.service';
import { TeamMemberService } from './team-member.service';
import { environment } from 'src/environments/environment';

describe('TeamMemberService', () => {
  let service: TeamMemberService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [CompanyProfileStoreService, TeamMemberService],
    });
    service = TestBed.inject(TeamMemberService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list team members and update store data', () => {
    const reqOptions = { search: '', limit: 10, offset: 0 };
    const mockData = { data: [{ id: 1, name: 'John Doe' }] };

    service.listTeamMembers(reqOptions);

    const req = httpMock.expectOne(
      `${environment.baseUrl}/supply-chain/node/member/?search=&limit=10&offset=0`
    );
    expect(req.request.method).toBe('GET');

    req.flush(mockData);
  });

  it('should search for members by email', () => {
    const email = 'test@example.com';
    const mockData = [{ id: 1, email }];

    service.searchEmail(email).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/accounts/user/search/?email=${email}`
    );
    expect(req.request.method).toBe('GET');

    req.flush({ data: { results: mockData } });
  });

  it('should resend member invite', () => {
    const teamId = 1;
    const formData = new FormData();
    const mockResponse = { success: true };

    service.resendMemberInvite(formData, teamId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/supply-chain/node/member/${teamId}/resend/`
    );
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });

  it('should add team member', () => {
    const formData = new FormData();
    const mockResponse = { success: true };

    service.addTeam(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/supply-chain/node/member/`
    );
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });

  it('should update member role', () => {
    const memberId = 1;
    const newRole = 'admin';
    const mockResponse = { success: true };

    service.updateRole(memberId, newRole).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/supply-chain/node/member/${memberId}/`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ type: newRole });

    req.flush(mockResponse);
  });

  it('should remove team member', () => {
    const memberId = 1;
    const mockResponse = { success: true };

    service.removeMember(memberId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/supply-chain/node/member/${memberId}/`
    );
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });

  it('should return role list with translated names', () => {
    const roleList = service.roleList();
    expect(roleList.length).toBe(3);
    expect(roleList[0].name).toContain('admin');
    expect(roleList[1].name).toContain('member');
    expect(roleList[2].name).toContain('viewer');
  });
});
