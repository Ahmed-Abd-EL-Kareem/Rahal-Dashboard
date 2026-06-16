import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubscriptionPlans } from './admin-subscription-plans';

describe('AdminSubscriptionPlans', () => {
  let component: AdminSubscriptionPlans;
  let fixture: ComponentFixture<AdminSubscriptionPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubscriptionPlans],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubscriptionPlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
