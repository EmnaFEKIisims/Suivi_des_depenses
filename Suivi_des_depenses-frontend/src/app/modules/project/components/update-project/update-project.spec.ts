import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProject } from './update-project';

describe('UpdateProject', () => {
  let component: UpdateProject;
  let fixture: ComponentFixture<UpdateProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
