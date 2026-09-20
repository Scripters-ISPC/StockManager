import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosFormulario } from './usuarios-formulario';

describe('UsuariosFormulario', () => {
  let component: UsuariosFormulario;
  let fixture: ComponentFixture<UsuariosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
