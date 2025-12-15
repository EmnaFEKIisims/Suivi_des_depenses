import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { employeeDataGuard } from './employee-data-guard';

describe('employeeDataGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => employeeDataGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
