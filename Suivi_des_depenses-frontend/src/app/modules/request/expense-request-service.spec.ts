import { TestBed } from '@angular/core/testing';

import { ExpenseRequestService } from './expense-request-service';

describe('ExpenseRequestService', () => {
  let service: ExpenseRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
