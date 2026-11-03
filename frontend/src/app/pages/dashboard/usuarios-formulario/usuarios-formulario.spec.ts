import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { vi } from 'vitest';
import { UsuariosService } from '../../../core/services/usuarios';
import { UsuariosFormulario } from './usuarios-formulario';

describe('UsuariosFormulario', () => {
  let component: UsuariosFormulario;
  let fixture: ComponentFixture<UsuariosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosFormulario],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to Operario and offers Administrador', () => {
    const opciones = fixture.nativeElement.querySelectorAll('#rol option');

    expect(component.formularioUsuario.controls.rol.value).toBe('Operario');
    expect(Array.from(opciones, (opcion: HTMLOptionElement) => opcion.value)).toEqual([
      'Operario',
      'Administrador',
    ]);
  });

  it('requires passwords to contain at least 8 characters', () => {
    const clave = component.formularioUsuario.controls.clave;

    clave.setValue('1234567');
    expect(clave.hasError('minlength')).toBe(true);

    clave.setValue('12345678');
    expect(clave.hasError('minlength')).toBe(false);
  });

  it('submits the selected role', () => {
    const agregarUsuario = vi.spyOn(TestBed.inject(UsuariosService), 'agregarUsuario')
      .mockReturnValue(NEVER);
    component.formularioUsuario.setValue({
      nombre: 'Ana Perez',
      correo: 'ana@stockmanager.com',
      clave: 'clave-segura',
      rol: 'Administrador',
    });

    component.onSubmit();

    expect(agregarUsuario).toHaveBeenCalledWith({
      nombre: 'Ana Perez',
      correo: 'ana@stockmanager.com',
      password: 'clave-segura',
      rol: 'Administrador',
    });
  });
});
