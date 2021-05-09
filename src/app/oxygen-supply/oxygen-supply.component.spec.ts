import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OxygenSupplyComponent } from './oxygen-supply.component';

describe('OxygenSupplyComponent', () => {
  let component: OxygenSupplyComponent;
  let fixture: ComponentFixture<OxygenSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OxygenSupplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OxygenSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
