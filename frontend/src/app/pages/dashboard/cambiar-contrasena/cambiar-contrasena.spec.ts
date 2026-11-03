import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth';
import { CambiarContrasena } from './cambiar-contrasena';

describe('CambiarContrasena', () => {
  let component: CambiarContrasena;
  let fixture: ComponentFixture<CambiarContrasena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarContrasena],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarContrasena);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('creates the password change form', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit when the new passwords do not match', () => {
    const cambiarContrasena = vi.spyOn(TestBed.inject(AuthService), 'cambiarContrasena');
    component.formulario.setValue({
      contrasena_actual: 'ClaveActual99!',
      nueva_contrasena: 'NuevaClave88!',
      confirmar_contrasena: 'OtraClave77!',
    });

    component.onSubmit();

    expect(cambiarContrasena).not.toHaveBeenCalled();
    expect(component.formulario.hasError('contrasenasNoCoinciden')).toBe(true);
  });

  it('submits the validated password data', () => {
    const cambiarContrasena = vi.spyOn(TestBed.inject(AuthService), 'cambiarContrasena')
      .mockReturnValue(of({ detail: 'La contraseña se actualizó correctamente.' }));
    const datos = {
      contrasena_actual: 'ClaveActual99!',
      nueva_contrasena: 'NuevaClave88!',
      confirmar_contrasena: 'NuevaClave88!',
    };
    component.formulario.setValue(datos);

    component.onSubmit();

    expect(cambiarContrasena).toHaveBeenCalledWith(datos);
    expect(component.exitoMensaje()).toBe('La contraseña se actualizó correctamente.');
  });
});