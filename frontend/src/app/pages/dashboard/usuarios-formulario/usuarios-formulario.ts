import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../core/services/usuarios';

export function dominioEmpresaValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value as string;
  if (email && email.includes('@')) {
    const dominio = email.split('@')[1];
    if (dominio !== 'stockmanager.com') {
      return { dominioInvalido: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-usuarios-formulario',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './usuarios-formulario.html',
  styleUrl: './usuarios-formulario.css'
})
export class UsuariosFormulario implements OnInit {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  enviando = signal(false);
  modoEdicion = signal(false);
  cargandoUsuario = signal(false);
  private usuarioId: number | null = null;

  formularioUsuario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required, Validators.email, dominioEmpresaValidator]),
    clave: new FormControl('', [Validators.required, Validators.minLength(8)]),
    rol: new FormControl<'Administrador' | 'Operario'>('Operario', { nonNullable: true })
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (!Number.isInteger(id) || id < 1) {
      this.router.navigate(['/dashboard/usuarios']);
      return;
    }

    this.usuarioId = id;
    this.modoEdicion.set(true);
    this.cargandoUsuario.set(true);
    const clave = this.formularioUsuario.controls.clave;
    clave.clearValidators();
    clave.addValidators(Validators.minLength(8));
    clave.updateValueAndValidity();

    this.usuariosService.getUsuarioById(id).subscribe({
      next: (usuario) => {
        this.formularioUsuario.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
        });
        this.cargandoUsuario.set(false);
      },
      error: () => {
        this.cargandoUsuario.set(false);
        alert('No se pudo cargar el usuario para editar.');
        this.router.navigate(['/dashboard/usuarios']);
      },
    });
  }

  onSubmit() {
    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const vals = this.formularioUsuario.getRawValue();

    const peticion = this.usuarioId === null
      ? this.usuariosService.agregarUsuario({
          nombre: vals.nombre!,
          correo: vals.correo!,
          password: vals.clave!,
          rol: vals.rol,
        })
      : this.usuariosService.actualizarUsuario(this.usuarioId, {
          nombre: vals.nombre!,
          correo: vals.correo!,
          ...(vals.clave ? { password: vals.clave } : {}),
          rol: vals.rol,
        });

    peticion.subscribe({
      next: () => {
        this.enviando.set(false);
        alert(this.modoEdicion() ? '¡Usuario actualizado con éxito!' : '¡Cuenta creada con éxito!');
        this.router.navigate(['/dashboard/usuarios']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 401) {
          alert('Tu sesión venció o no está autenticada. Iniciá sesión con una cuenta administradora.');
          return;
        }
        if (error.status === 403) {
          alert('Tu sesión no tiene permisos de administrador. Iniciá sesión con una cuenta administradora.');
          return;
        }
        if (error.status === 400 && error.error && typeof error.error === 'object') {
          const detalles = Object.entries(error.error)
            .flatMap(([campo, mensajes]) =>
              (Array.isArray(mensajes) ? mensajes : [mensajes])
                .filter((mensaje): mensaje is string => typeof mensaje === 'string')
                .map((mensaje) => `${campo}: ${mensaje}`),
            );
          alert(detalles.length ? detalles.join('\n') : 'Revisá los datos ingresados y volvé a intentar.');
          return;
        }
        alert('No se pudo crear el usuario. Verificá que el servidor esté activo.');
      }
    });
  }
}