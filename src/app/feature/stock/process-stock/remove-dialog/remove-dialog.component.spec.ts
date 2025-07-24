import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RemoveDialogComponent } from './remove-dialog.component';

describe('RemoveDialogComponent', () => {
  let component: RemoveDialogComponent;
  let fixture: ComponentFixture<RemoveDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RemoveDialogComponent>>;

  beforeEach(async () => {
    // Create a spy object for MatDialogRef
    const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [RemoveDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'mockId' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<RemoveDialogComponent>
    >;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should remove the item and close the dialog', () => {
    component.remove();
    expect(dialogRef.close).toHaveBeenCalledWith('mockId');
  });
});
