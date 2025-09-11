import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBudgetLine } from './create-budget-line';

describe('CreateBudgetLine', () => {
  let component: CreateBudgetLine;
  let fixture: ComponentFixture<CreateBudgetLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBudgetLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBudgetLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
