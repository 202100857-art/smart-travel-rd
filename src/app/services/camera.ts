import { Injectable, signal } from '@angular/core';
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';

export interface CapturedTravelPhoto {
  webPath: string;
  format: string;
  capturedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private readonly photoState =
    signal<CapturedTravelPhoto | null>(null);

  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly photo = this.photoState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  async capturePhoto(): Promise<CapturedTravelPhoto | null> {
    if (this.loadingState()) {
      return null;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    try {
      const result: Photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: false,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
        resultType: CameraResultType.Uri,
        webUseInput: true,
      });

      if (!result.webPath) {
        throw new Error(
          'La cámara no devolvió una imagen válida.'
        );
      }

      const photo: CapturedTravelPhoto = {
        webPath: result.webPath,
        format: result.format || 'jpeg',
        capturedAt: new Date().toISOString(),
      };

      this.photoState.set(photo);

      return photo;
    } catch (error: unknown) {
      const message = this.getErrorMessage(error);

      if (!this.isCancellation(message)) {
        console.error(
          'No fue posible utilizar la cámara:',
          error
        );

        this.errorState.set(
          'No fue posible capturar la fotografía.'
        );
      }

      return null;
    } finally {
      this.loadingState.set(false);
    }
  }

  removePhoto(): void {
    this.photoState.set(null);
    this.errorState.set('');
  }

  clearError(): void {
    this.errorState.set('');
  }

  private getErrorMessage(error: unknown): string {
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

  private isCancellation(message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    return (
      normalizedMessage.includes('cancel') ||
      normalizedMessage.includes('canceled') ||
      normalizedMessage.includes('cancelled')
    );
  }
}