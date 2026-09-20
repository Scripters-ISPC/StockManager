import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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
  
  formularioUsuario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required, Validators.email, dominioEmpresaValidator]),
    clave: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rol: new FormControl({ value: 'Operario', disabled: true }) 
  });

 
  onSubmit() {
    if (this.formularioUsuario.valid) {
      console.log('Datos a guardar:', this.formularioUsuario.getRawValue());
      alert('¡Cuenta de operario creada con éxito!');
      this.formularioUsuario.reset({ rol: 'Operario' });
    } else {
      this.formularioUsuario.markAllAsTouched();
    }
  }
}