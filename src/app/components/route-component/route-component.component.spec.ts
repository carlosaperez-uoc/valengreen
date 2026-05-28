import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteComponentComponent } from './route-component.component';

describe('RouteComponentComponent', () => {
  let component: RouteComponentComponent;
  let fixture: ComponentFixture<RouteComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RouteComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
