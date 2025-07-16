import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestList } from './request-list';

describe('RequestList', () => {
  let component: RequestList;
  let fixture: ComponentFixture<RequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
