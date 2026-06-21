import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlansComponentmag } from './admin-plans-componentmag';

describe('AdminPlansComponentmag', () => {
  let component: AdminPlansComponentmag;
  let fixture: ComponentFixture<AdminPlansComponentmag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPlansComponentmag],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPlansComponentmag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
