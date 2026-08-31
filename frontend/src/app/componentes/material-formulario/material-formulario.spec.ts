import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialFormulario } from './material-formulario';

describe('MaterialFormulario', () => {
  let component: MaterialFormulario;
  let fixture: ComponentFixture<MaterialFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
