import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { WizardStepComponent } from './wizard-step.component';
import { ShrinkPipe } from './wizard-step.pipe';

describe('WizardStepComponent', () => {
  let fixture: ComponentFixture<WizardStepComponent>;
  let component: WizardStepComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, ShrinkPipe, WizardStepComponent],
    });

    fixture = TestBed.createComponent(WizardStepComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the itemClicked event when stepClicked is called', () => {
    spyOn(component.itemClicked, 'emit');
    component.stepClicked(0);

    expect(component.itemClicked.emit).toHaveBeenCalledWith(0);
  });
});
