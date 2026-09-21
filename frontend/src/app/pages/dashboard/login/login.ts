import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  errorMsg = signal('');

  loginForm = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  ngOnInit() {
    if (this.authService.getRole()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { correo, password } = this.loginForm.value;
    this.cargando.set(true);
    this.errorMsg.set('');

    this.authService.loginConCredenciales(correo!, password!).subscribe(usuario => {
      this.cargando.set(false);
      if (usuario) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg.set('Correo o contraseña incorrectos. Verificá tus datos.');
      }
    });
  }

  get correoCtrl() { return this.loginForm.get('correo'); }
  get passwordCtrl() { return this.loginForm.get('password'); }
}
