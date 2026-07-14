import { Injectable, signal } from '@angular/core';
import {
  Network,
  NetworkStatus,
  ConnectionType,
} from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {

  private connectedSignal = signal(false);

  private connectionTypeSignal =
    signal<ConnectionType>('unknown');

  private initializedSignal = signal(false);

  connected = this.connectedSignal.asReadonly();

  connectionType =
    this.connectionTypeSignal.asReadonly();

  initialized =
    this.initializedSignal.asReadonly();

  constructor() {
    this.initialize();
  }

  async initialize() {

    try {

      const status = await Network.getStatus();

      this.updateStatus(status);

      Network.addListener(
        'networkStatusChange',
        (status: NetworkStatus) => {

          this.updateStatus(status);

        }
      );

    } catch (error) {

      console.error(error);

      this.connectedSignal.set(navigator.onLine);

    }

    this.initializedSignal.set(true);

  }

  private updateStatus(status: NetworkStatus) {

    this.connectedSignal.set(status.connected);

    this.connectionTypeSignal.set(status.connectionType);

  }

  get connectionLabel(): string {

    switch (this.connectionType()) {

      case 'wifi':
        return 'Wi-Fi';

      case 'cellular':
        return 'Datos móviles';

      case 'none':
        return 'Sin conexión';

      default:
        return 'Conexión desconocida';

    }

  }

}