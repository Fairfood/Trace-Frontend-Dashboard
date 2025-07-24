import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCodeGeneratorComponent } from './qr-code-generator.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';

describe('QrCodeGeneratorComponent', () => {
  let component: QrCodeGeneratorComponent;
  let fixture: ComponentFixture<QrCodeGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QrCodeGeneratorComponent,
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        ClipboardModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
