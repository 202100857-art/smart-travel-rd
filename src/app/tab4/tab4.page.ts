import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar, IonTitle } from '@ionic/angular/standalone';

interface TravelTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [IonTitle, 
    CommonModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
  ],
})
export class Tab4Page {
  selectedTool: TravelTool | null = null;

  audioPlaying = false;

  tools: TravelTool[] = [
    {
      id: 'camera',
      title: 'Cámara',
      description: 'Captura documentos, comprobantes y recuerdos del viaje.',
      icon: 'camera-outline',
      colorClass: 'camera-tool',
      status: 'Disponible',
      statusClass: 'available',
    },
    {
      id: 'qr',
      title: 'Escáner QR',
      description: 'Lee códigos de boletos, reservas y entradas turísticas.',
      icon: 'qr-code-outline',
      colorClass: 'qr-tool',
      status: 'Disponible',
      statusClass: 'available',
    },
    {
      id: 'audio',
      title: 'Audioguía',
      description: 'Escucha información sobre destinos y monumentos.',
      icon: 'headset-outline',
      colorClass: 'audio-tool',
      status: 'Demo',
      statusClass: 'demo',
    },
    {
      id: 'bluetooth',
      title: 'Bluetooth',
      description: 'Detecta dispositivos cercanos compatibles con BLE.',
      icon: 'bluetooth-outline',
      colorClass: 'bluetooth-tool',
      status: 'Requiere dispositivo',
      statusClass: 'hardware',
    },
    {
      id: 'nfc',
      title: 'NFC',
      description: 'Comparte información del viaje mediante acercamiento.',
      icon: 'phone-portrait-outline',
      colorClass: 'nfc-tool',
      status: 'Según compatibilidad',
      statusClass: 'hardware',
    },
  ];

  selectTool(tool: TravelTool): void {
    this.selectedTool = tool;
  }

  closeToolDetails(): void {
    this.selectedTool = null;
  }

  toggleAudio(): void {
    this.audioPlaying = !this.audioPlaying;
  }
}