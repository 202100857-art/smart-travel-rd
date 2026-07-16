import { Injectable, signal } from '@angular/core';

import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { firebaseAuth } from '../config/firebase.config';

export interface AuthResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userState =
    signal<User | null>(null);

  private readonly loadingState =
    signal(true);

  private readonly errorState =
    signal('');

  readonly user =
    this.userState.asReadonly();

  readonly loading =
    this.loadingState.asReadonly();

  readonly error =
    this.errorState.asReadonly();

  readonly initialized =
    signal(false);

  constructor() {
    onAuthStateChanged(
      firebaseAuth,
      (user: User | null) => {
        this.userState.set(user);
        this.loadingState.set(false);
        this.initialized.set(true);
      },
      (error: Error) => {
        console.error(
          'Error observando la sesión:',
          error
        );

        this.userState.set(null);
        this.loadingState.set(false);
        this.initialized.set(true);
        this.errorState.set(
          'No fue posible comprobar la sesión.'
        );
      }
    );
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> {
    this.loadingState.set(true);
    this.errorState.set('');

    try {
      const credential =
        await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password
        );

      const cleanName = name.trim();

      if (cleanName) {
        await updateProfile(
          credential.user,
          {
            displayName: cleanName,
          }
        );

        await credential.user.reload();

        this.userState.set(
          firebaseAuth.currentUser
        );
      }

      return {
        success: true,
        message:
          'Cuenta creada correctamente.',
      };
    } catch (error: unknown) {
      const message =
        this.getFriendlyError(error);

      this.errorState.set(message);

      return {
        success: false,
        message,
      };
    } finally {
      this.loadingState.set(false);
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<AuthResult> {
    this.loadingState.set(true);
    this.errorState.set('');

    try {
      await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      );

      return {
        success: true,
        message:
          'Inicio de sesión correcto.',
      };
    } catch (error: unknown) {
      const message =
        this.getFriendlyError(error);

      this.errorState.set(message);

      return {
        success: false,
        message,
      };
    } finally {
      this.loadingState.set(false);
    }
  }

  async loginWithGoogle():
    Promise<AuthResult> {
    this.loadingState.set(true);
    this.errorState.set('');

    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: 'select_account',
      });

      await signInWithPopup(
        firebaseAuth,
        provider
      );

      return {
        success: true,
        message:
          'Sesión iniciada con Google.',
      };
    } catch (error: unknown) {
      const message =
        this.getFriendlyError(error);

      this.errorState.set(message);

      return {
        success: false,
        message,
      };
    } finally {
      this.loadingState.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');

    try {
      await signOut(firebaseAuth);
      this.userState.set(null);
    } catch (error: unknown) {
      this.errorState.set(
        this.getFriendlyError(error)
      );

      throw error;
    } finally {
      this.loadingState.set(false);
    }
  }

  clearError(): void {
    this.errorState.set('');
  }

  get isAuthenticated(): boolean {
    return this.userState() !== null;
  }

  private getFriendlyError(
    error: unknown
  ): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado.';

      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';

      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';

      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Correo o contraseña incorrectos.';

      case 'auth/popup-closed-by-user':
        return 'La ventana de Google fue cerrada.';

      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana de Google.';

      case 'auth/network-request-failed':
        return 'No hay conexión con Firebase.';

      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta nuevamente más tarde.';

      case 'auth/account-exists-with-different-credential':
        return 'Este correo ya está asociado a otro método de acceso.';

      default:
        return 'No fue posible completar la autenticación.';
    }
  }

  private getErrorCode(
    error: unknown
  ): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error
    ) {
      return String(error.code);
    }

    return '';
  }
}