import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToast,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';

import {
  ThemeMode,
  ThemeService,
} from '../services/theme';

import { AuthService } from '../services/auth';

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  enabled: boolean;
}

interface ThemeOption {
  id: ThemeMode;
  title: string;
  description: string;
  icon: string;
}

type InformationPanel =
  | 'about'
  | 'permissions'
  | 'help'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'report'
  | 'logout'
  | null;

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToast,
    IonToggle,
    IonToolbar,
  ],
})
export class Tab5Page {
  profileExpanded = false;

  activePanel: InformationPanel = null;

  reportSubject = '';
  reportDescription = '';

  toastOpen = false;
  toastMessage = '';

  readonly themeOptions: ThemeOption[] = [
    {
      id: 'system',
      title: 'Automático',
      description:
        'Usar el tema configurado en el teléfono.',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'light',
      title: 'Claro',
      description:
        'Mantener siempre la interfaz clara.',
      icon: 'sunny-outline',
    },
    {
      id: 'dark',
      title: 'Oscuro',
      description:
        'Mantener siempre la interfaz oscura.',
      icon: 'moon-outline',
    },
  ];

  settings: SettingsOption[] = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      description:
        'Recibir avisos y recomendaciones de viaje.',
      icon: 'notifications-outline',
      colorClass: 'notification-option',
      enabled: true,
    },
    {
      id: 'location',
      title: 'Ubicación',
      description:
        'Permitir sugerencias basadas en tu posición.',
      icon: 'location-outline',
      colorClass: 'location-option',
      enabled: true,
    },
    {
      id: 'offline',
      title: 'Modo sin conexión',
      description:
        'Mantener disponibles los datos almacenados.',
      icon: 'cloud-offline-outline',
      colorClass: 'offline-option',
      enabled: false,
    },
  ];

  constructor(
    public readonly themeService: ThemeService,
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get userName(): string {
    return (
      this.authService.user()?.displayName ||
      'Viajero Smart Travel'
    );
  }

  get userEmail(): string {
    return (
      this.authService.user()?.email ||
      'Correo no disponible'
    );
  }

  get userPhoto(): string | null {
    return (
      this.authService.user()?.photoURL ||
      null
    );
  }

  get userInitials(): string {
    const name = this.userName.trim();

    if (!name) {
      return 'ST';
    }

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    const first =
      parts[0]?.charAt(0) || '';

    const second =
      parts.length > 1
        ? parts[parts.length - 1].charAt(0)
        : '';

    return `${first}${second}`.toUpperCase();
  }

  get accountProvider(): string {
    const provider =
      this.authService.user()
        ?.providerData?.[0]?.providerId;

    return provider === 'google.com'
      ? 'Cuenta de Google'
      : 'Correo y contraseña';
  }

  get accountCreatedAt(): string {
    const creationTime =
      this.authService.user()
        ?.metadata?.creationTime;

    if (!creationTime) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat(
      'es-DO',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    ).format(new Date(creationTime));
  }

  toggleProfile(): void {
    this.profileExpanded =
      !this.profileExpanded;
  }

  async changeTheme(
    mode: ThemeMode | string
  ): Promise<void> {
    if (
      mode !== 'system' &&
      mode !== 'light' &&
      mode !== 'dark'
    ) {
      return;
    }

    await this.themeService.setTheme(mode);
  }

  openPanel(
    panel: Exclude<InformationPanel, null>
  ): void {
    this.activePanel = panel;
  }

  closePanel(): void {
    this.activePanel = null;
  }

  async copySupportEmail(): Promise<void> {
    const email =
      'soporte@smarttravelrd.com';

    try {
      await navigator.clipboard.writeText(
        email
      );

      this.showToast(
        'Correo copiado al portapapeles.'
      );
    } catch {
      this.showToast(
        'No fue posible copiar el correo.'
      );
    }
  }

  sendSupportEmail(): void {
    window.location.href =
      'mailto:soporte@smarttravelrd.com?subject=Soporte%20Smart%20Travel%20RD';
  }

  submitReport(): void {
    const subject =
      this.reportSubject.trim();

    const description =
      this.reportDescription.trim();

    if (!subject || !description) {
      this.showToast(
        'Completa el asunto y la descripción.'
      );

      return;
    }

    this.reportSubject = '';
    this.reportDescription = '';

    this.closePanel();

    this.showToast(
      'El reporte fue registrado correctamente.'
    );
  }

  async confirmLogout(): Promise<void> {
    try {
      await this.authService.logout();

      this.closePanel();

      await this.router.navigateByUrl(
        '/auth',
        {
          replaceUrl: true,
        }
      );
    } catch {
      this.showToast(
        'No fue posible cerrar la sesión.'
      );
    }
  }

  private showToast(
    message: string
  ): void {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}


