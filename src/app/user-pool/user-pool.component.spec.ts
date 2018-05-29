import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPoolComponent } from './user-pool.component';

describe('UserPoolComponent', () => {
  let component: UserPoolComponent;
  let fixture: ComponentFixture<UserPoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
