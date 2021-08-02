import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ucZoomComponent } from './uc-zoom.component';

describe('ucZoomComponent', () => {
  let component: ucZoomComponent;
  let fixture: ComponentFixture<ucZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ucZoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ucZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
