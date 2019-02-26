import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendibleFieldSetComponent } from './extendible-field-set.component';

describe('ExtendibleFieldSetComponent', () => {
  let component: ExtendibleFieldSetComponent;
  let fixture: ComponentFixture<ExtendibleFieldSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendibleFieldSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendibleFieldSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
