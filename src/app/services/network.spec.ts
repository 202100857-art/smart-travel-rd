import { Injectable, signal } from '@angular/core';
import {
  ConnectionType,
  Network,
  NetworkStatus,
} from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly connectedState = signal<boolean>(false);

  private readonly connectionTypeState =
    signal<ConnectionType>('unknown');

  private readonly initializedState = signal<boolean>(false);

  readonly connected = this.connectedState.asReadonly();
  readonly connectionType = this.connectionTypeState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const currentStatus = await Network.getStatus();

      this.updateStatus(currentStatus);

      await Network.addListener(
        'networkStatusChange',
        (status: NetworkStatus) => {
          this.updateStatus(status);
        }
      );
    } catch (error) {
      console.error(
        'No fue posible obtener el estado de la red:',
        error
      );

      this.connectedState.set(navigator.onLine);
      this.connectionTypeState.set('unknown');
    } finally {
      this.initializedState.set(true);
    }
  }

  private updateStatus(status: NetworkStatus): void {
    this.connectedState.set(status.connected);
    this.connectionTypeState.set(status.connectionType);
  }

  get connectionLabel(): string {
    switch (this.connectionTypeState()) {
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