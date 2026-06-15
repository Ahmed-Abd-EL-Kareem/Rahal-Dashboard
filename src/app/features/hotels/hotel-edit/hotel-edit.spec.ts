import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelEdit } from './hotel-edit';

describe('HotelEdit', () => {
  let component: HotelEdit;
  let fixture: ComponentFixture<HotelEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
