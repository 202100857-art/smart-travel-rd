import { Injectable, signal } from '@angular/core';

import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

import {
  Haptics,
  ImpactStyle,
} from '@capacitor/haptics';

import { Preferences } from '@capacitor/preferences';

export type QrContentType =
  | 'smart-travel-place'
  | 'url'
  | 'text';

export interface QrScanResult {
  value: string;
  format: string;
  scannedAt: string;
  contentType: QrContentType;
  placeId: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {
  private readonly historyKey =
    'smart_travel_qr_history';

  private readonly resultState =
    signal<QrScanResult | null>(null);

  private readonly historyState =
    signal<QrScanResult[]>([]);

  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private readonly initializedState = signal(false);

  readonly result = this.resultState.asReadonly();
  readonly history = this.historyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();

  private initializationPromise?: Promise<void>;

  constructor() {
    void this.initialize();
  }

  initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise =
        this.loadHistory();
    }

    return this.initializationPromise;
  }

  async scanQrCode(): Promise<QrScanResult | null> {
    if (this.loadingState()) {
      return null;
    }

    await this.initialize();

    this.loadingState.set(true);
    this.errorState.set('');

    try {
      const scanResponse =
        await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          scanInstructions:
            'Coloca el código QR dentro del área de escaneo.',
          scanButton: true,
          scanText: 'Escanear',
        });

      const value =
        scanResponse.ScanResult?.trim();

      if (!value) {
        return null;
      }

      const result: QrScanResult = {
        value,
        format: String(
          scanResponse.format ?? 'QR_CODE'
        ),
        scannedAt: new Date().toISOString(),
        contentType:
          this.detectContentType(value),
        placeId:
          this.extractSmartTravelPlaceId(value),
      };

      this.resultState.set(result);

      await this.saveToHistory(result);
      await this.confirmSuccessfulScan();

      return result;
    } catch (error: unknown) {
      const message =
        this.getErrorMessage(error);

      if (!this.isCancellation(message)) {
        console.error(
          'No fue posible escanear el código QR:',
          error
        );

        this.errorState.set(
          'No fue posible leer el código QR. Revisa el permiso de cámara.'
        );
      }

      return null;
    } finally {
      this.loadingState.set(false);
    }
  }

  selectHistoryResult(
    result: QrScanResult
  ): void {
    this.resultState.set(result);
    this.errorState.set('');
  }

  clearResult(): void {
    this.resultState.set(null);
    this.errorState.set('');
  }

  clearError(): void {
    this.errorState.set('');
  }

  async clearHistory(): Promise<void> {
    await Preferences.remove({
      key: this.historyKey,
    });

    this.historyState.set([]);
  }

  isUrl(value: string): boolean {
    try {
      const url = new URL(value);

      return (
        url.protocol === 'http:' ||
        url.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  isSmartTravelPlace(
    result: QrScanResult
  ): boolean {
    return (
      result.contentType ===
        'smart-travel-place' &&
      result.placeId !== null
    );
  }

  private detectContentType(
    value: string
  ): QrContentType {
    if (
      this.extractSmartTravelPlaceId(value) !== null
    ) {
      return 'smart-travel-place';
    }

    if (this.isUrl(value)) {
      return 'url';
    }

    return 'text';
  }

  private extractSmartTravelPlaceId(
    value: string
  ): number | null {
    const customScheme =
      /^smarttravel:\/\/place\/(\d+)$/i;

    const webUrl =
      /^https?:\/\/(?:www\.)?smarttravelrd\.com\/place\/(\d+)\/?$/i;

    const customMatch =
      value.match(customScheme);

    const webMatch =
      value.match(webUrl);

    const match =
      customMatch ?? webMatch;

    if (!match?.[1]) {
      return null;
    }

    const placeId =
      Number.parseInt(match[1], 10);

    return Number.isNaN(placeId)
      ? null
      : placeId;
  }

  private async saveToHistory(
    result: QrScanResult
  ): Promise<void> {
    const previousHistory =
      this.historyState();

    const withoutDuplicate =
      previousHistory.filter(
        (item) => item.value !== result.value
      );

    const updatedHistory = [
      result,
      ...withoutDuplicate,
    ].slice(0, 5);

    await Preferences.set({
      key: this.historyKey,
      value: JSON.stringify(updatedHistory),
    });

    this.historyState.set(updatedHistory);
  }

  private async loadHistory(): Promise<void> {
    try {
      const storedValue =
        await Preferences.get({
          key: this.historyKey,
        });

      if (!storedValue.value) {
        this.historyState.set([]);
        return;
      }

      const parsedValue: unknown =
        JSON.parse(storedValue.value);

      if (!Array.isArray(parsedValue)) {
        throw new Error(
          'El historial QR almacenado no es válido.'
        );
      }

      this.historyState.set(
        parsedValue as QrScanResult[]
      );
    } catch (error: unknown) {
      console.error(
        'No fue posible cargar el historial QR:',
        error
      );

      this.historyState.set([]);
    } finally {
      this.initializedState.set(true);
    }
  }

  private async confirmSuccessfulScan():
    Promise<void> {
    try {
      await Haptics.impact({
        style: ImpactStyle.Medium,
      });
    } catch {
      /*
       * En navegador o dispositivos sin vibración,
       * la lectura sigue siendo válida.
       */
    }
  }

  private getErrorMessage(
    error: unknown
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      return String(error.message);
    }

    return 'Error desconocido';
  }

  private isCancellation(
    message: string
  ): boolean {
    const normalizedMessage =
      message.toLowerCase();

    return (
      normalizedMessage.includes('cancel') ||
      normalizedMessage.includes('cancelled') ||
      normalizedMessage.includes('canceled')
    );
  }
}