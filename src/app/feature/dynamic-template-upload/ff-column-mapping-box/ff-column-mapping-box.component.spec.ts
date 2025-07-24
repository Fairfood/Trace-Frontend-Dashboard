import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FfColumnMappingBoxComponent } from './';

describe('FfColumnMappingBoxComponent', () => {
  let component: FfColumnMappingBoxComponent;
  let fixture: ComponentFixture<FfColumnMappingBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfColumnMappingBoxComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FfColumnMappingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clearSelection event when itemClicked is called', () => {
    const clearSelectionSpy = spyOn(component.clearSelection, 'emit');
    const testData = { id: 1, name: 'Option 1' };
    component.itemClicked(testData);
    expect(clearSelectionSpy).toHaveBeenCalledWith(testData);
    expect(component.boxState).toEqual('default');
  });

  it('should emit itemSelected event when selectedItem is called', () => {
    const itemSelectedSpy = spyOn(component.itemSelected, 'emit');
    const testData = { id: 2, name: 'Option 2' };
    component.selectedItem(testData);
    expect(itemSelectedSpy).toHaveBeenCalledWith(testData);
    expect(component.boxState).toEqual('selected');
  });

  it('should set boxState to selected and value when ngOnChanges is called with defaultValue', () => {
    const changes: any = {
      defaultValue: { currentValue: 'Option 1' },
    };
    component.ngOnChanges(changes);
    expect(component.boxState).toEqual('selected');
    expect(component.value).toEqual('Option 1');
  });

  it('should close menu when closeMenu is called', () => {
    const closeMenuSpy = spyOn(component.dropdownMenuTrigger, 'closeMenu');
    component.closeMenu();
    expect(closeMenuSpy).toHaveBeenCalled();
  });

  it('should not set boxState to selected when ngOnChanges is called without defaultValue', () => {
    const changes: any = { defaultValue: { currentValue: undefined } };
    component.ngOnChanges(changes);
    expect(component.boxState).toEqual('default');
    expect(component.value).toBeUndefined();
  });
});
