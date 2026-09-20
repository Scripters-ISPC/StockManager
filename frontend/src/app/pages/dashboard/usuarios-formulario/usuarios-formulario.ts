import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './usuarios-formulario.html',
  styleUrl: './usuarios-formulario.css'
})
export class UsuariosFormulario {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  
  formularioUsuario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required, Validators.email, dominioEmpresaValidator]),
    clave: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rol: new FormControl({ value: 'Operario', disabled: true }) 
  });

  onSubmit() {
    if (this.formularioUsuario.valid) {
      const vals = this.formularioUsuario.getRawValue();
      this.usuariosService.agregarUsuario({
        nombre: vals.nombre || '',
        correo: vals.correo || '',
        rol: 'Operario'
      });
      alert('¡Cuenta de operario creada con éxito!');
      this.router.navigate(['/dashboard/usuarios']);
    } else {
      this.formularioUsuario.markAllAsTouched();
    }
  }
}