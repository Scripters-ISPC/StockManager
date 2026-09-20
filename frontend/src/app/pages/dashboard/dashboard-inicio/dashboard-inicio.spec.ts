import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardInicio } from './dashboard-inicio';

describe('DashboardInicio', () => {
  let component: DashboardInicio;
  let fixture: ComponentFixture<DashboardInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardInicio],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardInicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
