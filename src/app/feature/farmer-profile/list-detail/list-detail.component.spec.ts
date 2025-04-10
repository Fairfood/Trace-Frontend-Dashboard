import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListDetailComponent } from './list-detail.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

describe('ListDetailComponent', () => {
  let component: ListDetailComponent;
  let fixture: ComponentFixture<ListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDetailComponent, CommonModule, MatIconModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
