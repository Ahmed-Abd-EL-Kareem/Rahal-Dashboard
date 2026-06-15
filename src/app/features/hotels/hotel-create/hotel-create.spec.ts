import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelCreate } from './hotel-create';

describe('HotelCreate', () => {
  let component: HotelCreate;
  let fixture: ComponentFixture<HotelCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
