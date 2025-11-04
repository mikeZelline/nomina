import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  
  // Credenciales válidas
  private readonly VALID_USERNAME = 'admin';
  private readonly VALID_PASSWORD = '123';

  constructor(private router: Router) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular autenticación con delay
    setTimeout(() => {
      if (this.username === this.VALID_USERNAME && this.password === this.VALID_PASSWORD) {
        // Credenciales correctas - guardar usuario en localStorage
        localStorage.setItem('currentUser', this.username);
        this.isLoading = false;
        this.router.navigate(['/nomina']);
      } else {
        // Credenciales incorrectas
        this.isLoading = false;
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.username = '';
        this.password = '';
      }
    }, 1000);
  }
}
