import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NetworkService } from '../services/network';
import {  QrScanResult,  QrScannerService,} from '../services/qr-scanner';
import {  AudioGuide,  AudioGuideService,} from '../services/audio-guide';
import { CameraService } from '../services/camera';


import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';


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

  
  toastOpen = false;
  toastMessage = '';

  readonly tools: TravelTool[] = [
  {
    id: 'camera',
    title: 'Cámara',
    description:
      'Captura fotografías de destinos, documentos y recuerdos de tu viaje.',
    icon: 'camera-outline',
    colorClass: 'camera-tool',
    status: 'Disponible',
    statusClass: 'available',
  },
  {
    id: 'qr',
    title: 'Escáner QR',
    description:
      'Escanea códigos QR de lugares turísticos, reservas y puntos de interés.',
    icon: 'qr-code-outline',
    colorClass: 'qr-tool',
    status: 'Disponible',
    statusClass: 'available',
  },
  {
    id: 'audio',
    title: 'Audioguía',
    description:
      'Escucha información sobre monumentos y atractivos turísticos de República Dominicana.',
    icon: 'headset-outline',
    colorClass: 'audio-tool',
    status: 'Disponible',
    statusClass: 'available',
  },
  {
    id: 'bluetooth',
    title: 'Bluetooth',
    description:
      'Detecta dispositivos cercanos compatibles mediante Bluetooth Low Energy (BLE).',
    icon: 'bluetooth-outline',
    colorClass: 'bluetooth-tool',
    status: 'Según hardware',
    statusClass: 'hardware',
  },
  {
    id: 'nfc',
    title: 'NFC',
    description:
      'Lee etiquetas inteligentes y comparte información utilizando tecnología NFC.',
    icon: 'phone-portrait-outline',
    colorClass: 'nfc-tool',
    status: 'Según hardware',
    statusClass: 'hardware',
  },
];

constructor(
  public readonly cameraService: CameraService,
  public readonly networkService: NetworkService,
  public readonly qrScanner: QrScannerService,
  public readonly audioGuideService: AudioGuideService
) {
  void this.qrScanner.initialize();
}

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

  if (!photo) {
    return;
  }

  this.toastMessage =
    'Fotografía capturada correctamente.';

  this.toastOpen = true;
}

async selectPhoto(): Promise<void> {
  const photo =
    await this.cameraService.selectPhoto();

  if (!photo) {
    return;
  }

  this.toastMessage =
    'Imagen seleccionada correctamente.';

  this.toastOpen = true;
}

removePhoto(): void {
  this.cameraService.removePhoto();

  this.toastMessage =
    'La imagen fue eliminada.';

  this.toastOpen = true;
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

async scanQr(): Promise<void> {
  const result =
    await this.qrScanner.scanQrCode();

  if (!result) {
    return;
  }

  if (
    result.contentType ===
    'smart-travel-place'
  ) {
    this.toastMessage =
      `Destino Smart Travel detectado: lugar ${result.placeId}.`;
  } else if (
    result.contentType === 'url'
  ) {
    this.toastMessage =
      'Enlace QR leído correctamente.';
  } else {
    this.toastMessage =
      'Código QR leído correctamente.';
  }

  this.toastOpen = true;
}

selectQrHistory(
  result: QrScanResult
): void {
  this.qrScanner.selectHistoryResult(result);

  this.toastMessage =
    'Escaneo recuperado del historial.';

  this.toastOpen = true;
}

clearQr(): void {
  this.qrScanner.clearResult();
}

async clearQrHistory(): Promise<void> {
  await this.qrScanner.clearHistory();

  this.toastMessage =
    'Historial QR eliminado.';

  this.toastOpen = true;
}

async copyQr(): Promise<void> {
  const result =
    this.qrScanner.result();

  if (!result) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      result.value
    );

    this.toastMessage =
      'Contenido copiado al portapapeles.';
  } catch {
    this.toastMessage =
      'No fue posible copiar el contenido.';
  }

  this.toastOpen = true;
}

openQr(): void {
  const result =
    this.qrScanner.result();

  if (
    !result ||
    !this.qrScanner.isUrl(result.value)
  ) {
    return;
  }

  window.open(
    result.value,
    '_blank',
    'noopener,noreferrer'
  );
}

openSmartTravelPlace(): void {
  const result =
    this.qrScanner.result();

  if (
    !result ||
    result.placeId === null
  ) {
    return;
  }

  /*
   * Por ahora abre Explorar.
   * Más adelante podremos centrar automáticamente
   * el mapa en el lugar detectado.
   */
  window.location.href = '/tabs/tab2';
}

formatQrDate(value: string): string {
  return new Intl.DateTimeFormat(
    'es-DO',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(new Date(value));
}
async toggleAudioGuide(
  guide: AudioGuide
): Promise<void> {
  await this.audioGuideService.toggleGuide(
    guide
  );
}

stopAudioGuide(): void {
  this.audioGuideService.stop();
}

seekAudio(
  event: Event
): void {
  const input =
    event.target as HTMLInputElement;

  const percentage =
    Number(input.value);

  this.audioGuideService
    .seekToPercentage(percentage);
}

formatAudioTime(
  seconds: number
): string {
  return this.audioGuideService
    .formatTime(seconds);
}
}