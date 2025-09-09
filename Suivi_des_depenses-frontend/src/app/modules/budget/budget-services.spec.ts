import { TestBed } from '@angular/core/testing';

import { BudgetServices } from './budget-services';

describe('BudgetServices', () => {
  let service: BudgetServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
