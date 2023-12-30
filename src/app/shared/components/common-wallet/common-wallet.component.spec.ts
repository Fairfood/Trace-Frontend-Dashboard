import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonWalletComponent } from './common-wallet.component';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';

describe('CommonWalletComponent', () => {
  let fixture: ComponentFixture<CommonWalletComponent>;
  let component: CommonWalletComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTooltipModule,
        MatIconModule,
        ClipboardModule,
        CommonWalletComponent,
      ],
    });

    fixture = TestBed.createComponent(CommonWalletComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Logging in progress..." when wallet is empty', () => {
    component.wallet = '';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('span');
    expect(element.textContent).toContain('Logging in progress...');
  });

  it('should display the copy icon when showCopyIcon is true', () => {
    component.wallet = 'Your Wallet Address';
    component.showCopyIcon = true;
    fixture.detectChanges();
    const iconElement = fixture.nativeElement.querySelector('mat-icon');
    expect(iconElement).toBeTruthy();
  });

  // Add more test cases for different scenarios as needed
});
