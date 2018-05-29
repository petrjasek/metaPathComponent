import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetapathComponent } from './metapath.component';

describe('MetapathComponent', () => {
  let component: MetapathComponent;
  let fixture: ComponentFixture<MetapathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetapathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetapathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
