import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRequest } from './update-request';

describe('UpdateRequest', () => {
  let component: UpdateRequest;
  let fixture: ComponentFixture<UpdateRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
