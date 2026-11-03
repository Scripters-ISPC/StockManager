import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

function validarCoincidenciaContrasenas(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('nueva_contrasena')?.value;
  const confirmacion = control.get('confirmar_contrasena')?.value;
  return confirmacion && nueva !== confirmacion ? { contrasenasNoCoinciden: true } : null;
}

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cambiar-contrasena.html',
})
export class CambiarContrasena {
  private authService = inject(AuthService);

  guardando = signal(false);
  errorMensaje = signal<string | null>(null);
  exitoMensaje = signal<string | null>(null);

  formulario = new FormGroup({
    contrasena_actual: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nueva_contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmar_contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  }, { validators: validarCoincidenciaContrasenas });

  onSubmit(): void {
    this.errorMensaje.set(null);
    this.exitoMensaje.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.authService.cambiarContrasena(this.formulario.getRawValue()).pipe(
      finalize(() => this.guardando.set(false)),
    ).subscribe({
      next: (respuesta) => {
        this.exitoMensaje.set(respuesta.detail);
        this.formulario.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMensaje.set(this.obtenerMensajeError(error));
      },
    });
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Tu sesión venció. Iniciá sesión nuevamente e intentá otra vez.';
    }

    if (error.error && typeof error.error === 'object') {
      const mensajes = Object.values(error.error as Record<string, unknown>)
        .flatMap((valor) => Array.isArray(valor) ? valor : [valor])
        .filter((valor): valor is string => typeof valor === 'string');
      if (mensajes.length) return mensajes.join(' ');
    }

    return 'No se pudo actualizar la contraseña. Intentá nuevamente.';
  }
}