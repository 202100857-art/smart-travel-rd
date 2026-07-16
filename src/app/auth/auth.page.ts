import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonSpinner, IonHeader, IonToolbar } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner,
  ],
})
export class AuthPage {
  mode: AuthMode = 'login';

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  formError = '';
  successMessage = '';

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.formError = '';
    this.successMessage = '';
    this.password = '';
    this.confirmPassword = '';
    this.authService.clearError();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  async submit(): Promise<void> {
    this.formError = '';
    this.successMessage = '';
    this.authService.clearError();

    if (!this.email.trim()) {
      this.formError =
        'Ingresa tu correo electrónico.';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.formError =
        'Ingresa un correo electrónico válido.';
      return;
    }

    if (this.password.length < 6) {
      this.formError =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.mode === 'register') {
      await this.register();
      return;
    }

    await this.login();
  }

  async login(): Promise<void> {
    const result = await this.authService.login(
      this.email,
      this.password
    );

    if (!result.success) {
      this.formError = result.message;
      return;
    }

    await this.router.navigateByUrl(
      '/tabs/tab1',
      {
        replaceUrl: true,
      }
    );
  }

  async register(): Promise<void> {
    if (!this.name.trim()) {
      this.formError =
        'Ingresa tu nombre completo.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.formError =
        'Las contraseñas no coinciden.';
      return;
    }

    const result =
      await this.authService.register(
        this.name,
        this.email,
        this.password
      );

    if (!result.success) {
      this.formError = result.message;
      return;
    }

    await this.router.navigateByUrl(
      '/tabs/tab1',
      {
        replaceUrl: true,
      }
    );
  }

  async loginWithGoogle(): Promise<void> {
    this.formError = '';
    this.successMessage = '';
    this.authService.clearError();

    const result =
      await this.authService.loginWithGoogle();

    if (!result.success) {
      this.formError = result.message;
      return;
    }

    await this.router.navigateByUrl(
      '/tabs/tab1',
      {
        replaceUrl: true,
      }
    );
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  }
}