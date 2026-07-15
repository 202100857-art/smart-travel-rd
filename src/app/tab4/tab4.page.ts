import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NetworkService } from '../services/network';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

import { CameraService } from '../services/camera';

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
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToast,
    IonToolbar,
  ],
})
export class Tab4Page {
  selectedTool: TravelTool | null = null;

  audioPlaying = false;

  toastOpen = false;
  toastMessage = '';

  readonly tools: TravelTool[] = [
    {
      id: 'camera',
      title: 'Cámara',
      description:
        'Captura documentos, comprobantes y recuerdos del viaje.',
      icon: 'camera-outline',
      colorClass: 'camera-tool',
      status: 'Funcional',
      statusClass: 'available',
    },
    {
      id: 'qr',
      title: 'Escáner QR',
      description:
        'Lee códigos de boletos, reservas y entradas turísticas.',
      icon: 'qr-code-outline',
      colorClass: 'qr-tool',
      status: 'Próximo módulo',
      statusClass: 'demo',
    },
    {
      id: 'audio',
      title: 'Audioguía',
      description:
        'Escucha información sobre destinos y monumentos.',
      icon: 'headset-outline',
      colorClass: 'audio-tool',
      status: 'Demo',
      statusClass: 'demo',
    },
    {
      id: 'bluetooth',
      title: 'Bluetooth',
      description:
        'Detecta dispositivos cercanos compatibles con BLE.',
      icon: 'bluetooth-outline',
      colorClass: 'bluetooth-tool',
      status: 'Requiere dispositivo',
      statusClass: 'hardware',
    },
    {
      id: 'nfc',
      title: 'NFC',
      description:
        'Comparte información del viaje mediante acercamiento.',
      icon: 'phone-portrait-outline',
      colorClass: 'nfc-tool',
      status: 'Según compatibilidad',
      statusClass: 'hardware',
    },
  ];

 constructor(
  public readonly cameraService: CameraService,
  public readonly networkService: NetworkService
) {}

  selectTool(tool: TravelTool): void {
    this.selectedTool = tool;
  }

  closeToolDetails(): void {
    this.selectedTool = null;
    this.cameraService.clearError();
  }

  async capturePhoto(): Promise<void> {
    const photo =
      await this.cameraService.capturePhoto();

    if (photo) {
      this.toastMessage =
        'Fotografía capturada correctamente.';

      this.toastOpen = true;
    }
  }

  removePhoto(): void {
    this.cameraService.removePhoto();

    this.toastMessage =
      'La vista previa fue eliminada.';

    this.toastOpen = true;
  }

  toggleAudio(): void {
    this.audioPlaying = !this.audioPlaying;
  }

  formatCaptureDate(value: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
}