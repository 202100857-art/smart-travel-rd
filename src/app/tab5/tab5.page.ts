import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToggle,
  IonToolbar, IonTitle } from '@ionic/angular/standalone';

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  enabled: boolean;
}

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [IonTitle, 
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToggle,
    IonToolbar,
  ],
})
export class Tab5Page {
  profileExpanded = false;

  settings: SettingsOption[] = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Recibir avisos y recomendaciones de viaje.',
      icon: 'notifications-outline',
      colorClass: 'notification-option',
      enabled: true,
    },
    {
      id: 'location',
      title: 'Ubicación',
      description: 'Permitir sugerencias basadas en tu posición.',
      icon: 'location-outline',
      colorClass: 'location-option',
      enabled: true,
    },
    {
      id: 'offline',
      title: 'Modo sin conexión',
      description: 'Mantener disponibles los datos almacenados.',
      icon: 'cloud-offline-outline',
      colorClass: 'offline-option',
      enabled: false,
    },
  ];

  toggleProfile(): void {
    this.profileExpanded = !this.profileExpanded;
  }
}