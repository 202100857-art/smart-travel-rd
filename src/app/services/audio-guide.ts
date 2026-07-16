import {
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  firstValueFrom,
} from 'rxjs';

export interface AudioGuide {
  id: number;
  title: string;
  destination: string;
  description: string;
  audioUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioGuideService implements OnDestroy {
  private readonly audio = new Audio();

  private localAudioUrl: string | null = null;

  private readonly currentGuideState =
    signal<AudioGuide | null>(null);

  private readonly playingState =
    signal(false);

  private readonly loadingState =
    signal(false);

  private readonly currentTimeState =
    signal(0);

  private readonly durationState =
    signal(0);

  private readonly errorState =
    signal('');

  readonly currentGuide =
    this.currentGuideState.asReadonly();

  readonly playing =
    this.playingState.asReadonly();

  readonly loading =
    this.loadingState.asReadonly();

  readonly currentTime =
    this.currentTimeState.asReadonly();

  readonly duration =
    this.durationState.asReadonly();

  readonly error =
    this.errorState.asReadonly();

  readonly guides: AudioGuide[] = [
    {
      id: 1,
      title: 'Historia de la Zona Colonial',
      destination: 'Zona Colonial',
      description:
        'Conoce los monumentos, calles y acontecimientos históricos de la Ciudad Colonial.',
      audioUrl:
        'https://generic-denial-budding.ngrok-free.dev/smart-travel-api/api/audio.php',
    },
  ];

  constructor(
    private readonly http: HttpClient
  ) {
    this.configureAudioEvents();
  }

  async playGuide(
    guide: AudioGuide
  ): Promise<void> {
    if (this.loadingState()) {
      return;
    }

    this.errorState.set('');

    const currentGuide =
      this.currentGuideState();

    try {
      this.loadingState.set(true);

      if (
        !currentGuide ||
        currentGuide.id !== guide.id
      ) {
        await this.prepareGuide(guide);
      }

      await this.audio.play();
    } catch (error: unknown) {
      console.error(
        'No fue posible reproducir la audioguía:',
        error
      );

      this.errorState.set(
        'No fue posible reproducir la audioguía. Verifica tu conexión y que ngrok esté activo.'
      );

      this.playingState.set(false);
    } finally {
      this.loadingState.set(false);
    }
  }

  pause(): void {
    this.audio.pause();
  }

  async toggleGuide(
    guide: AudioGuide
  ): Promise<void> {
    const currentGuide =
      this.currentGuideState();

    if (
      currentGuide?.id === guide.id &&
      this.playingState()
    ) {
      this.pause();
      return;
    }

    await this.playGuide(guide);
  }

  stop(): void {
    this.audio.pause();

    if (this.audio.src) {
      this.audio.currentTime = 0;
    }

    this.playingState.set(false);
    this.currentTimeState.set(0);
  }

  seekToPercentage(
    percentage: number
  ): void {
    const duration = this.audio.duration;

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const safePercentage = Math.min(
      100,
      Math.max(0, percentage)
    );

    this.audio.currentTime =
      duration * (safePercentage / 100);
  }

  get progressPercentage(): number {
    const duration =
      this.durationState();

    if (duration <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (
        this.currentTimeState() /
        duration
      ) * 100
    );
  }

  formatTime(
    seconds: number
  ): string {
    if (!Number.isFinite(seconds)) {
      return '00:00';
    }

    const totalSeconds =
      Math.max(
        0,
        Math.floor(seconds)
      );

    const minutes =
      Math.floor(totalSeconds / 60);

    const remainingSeconds =
      totalSeconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  clearError(): void {
    this.errorState.set('');
  }

  ngOnDestroy(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();

    this.releaseLocalAudioUrl();
  }

  private async prepareGuide(
    guide: AudioGuide
  ): Promise<void> {
    this.audio.pause();

    this.releaseLocalAudioUrl();

    this.audio.removeAttribute('src');
    this.audio.load();

    this.currentTimeState.set(0);
    this.durationState.set(0);
    this.playingState.set(false);

    const audioBlob =
      await firstValueFrom(
        this.http.get(
          guide.audioUrl,
          {
            headers: {
              Accept: 'audio/mpeg,audio/*',
              'ngrok-skip-browser-warning':
                'true',
            },
            responseType: 'blob',
          }
        )
      );

    if (
      !audioBlob ||
      audioBlob.size === 0
    ) {
      throw new Error(
        'El archivo de audio está vacío.'
      );
    }

    if (
      audioBlob.type &&
      !audioBlob.type.startsWith('audio/')
    ) {
      throw new Error(
        'El servidor no devolvió un archivo de audio válido.'
      );
    }

    this.localAudioUrl =
      URL.createObjectURL(audioBlob);

    this.audio.src =
      this.localAudioUrl;

    this.audio.currentTime = 0;

    this.currentGuideState.set(
      guide
    );

    this.audio.load();

    await this.waitUntilAudioIsReady();
  }

  private waitUntilAudioIsReady():
    Promise<void> {
    if (
      this.audio.readyState >=
      HTMLMediaElement.HAVE_METADATA
    ) {
      return Promise.resolve();
    }

    return new Promise(
      (resolve, reject) => {
        const handleReady = (): void => {
          cleanup();
          resolve();
        };

        const handleError = (): void => {
          cleanup();

          reject(
            new Error(
              'No se pudo preparar el archivo de audio.'
            )
          );
        };

        const cleanup = (): void => {
          this.audio.removeEventListener(
            'loadedmetadata',
            handleReady
          );

          this.audio.removeEventListener(
            'error',
            handleError
          );
        };

        this.audio.addEventListener(
          'loadedmetadata',
          handleReady,
          {
            once: true,
          }
        );

        this.audio.addEventListener(
          'error',
          handleError,
          {
            once: true,
          }
        );
      }
    );
  }

  private releaseLocalAudioUrl(): void {
    if (!this.localAudioUrl) {
      return;
    }

    URL.revokeObjectURL(
      this.localAudioUrl
    );

    this.localAudioUrl = null;
  }

  private configureAudioEvents(): void {
    this.audio.preload = 'metadata';

    this.audio.addEventListener(
      'loadstart',
      () => {
        this.loadingState.set(true);
      }
    );

    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        this.durationState.set(
          Number.isFinite(
            this.audio.duration
          )
            ? this.audio.duration
            : 0
        );

        this.loadingState.set(false);
      }
    );

    this.audio.addEventListener(
      'canplay',
      () => {
        this.loadingState.set(false);
      }
    );

    this.audio.addEventListener(
      'play',
      () => {
        this.playingState.set(true);
      }
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.playingState.set(false);
      }
    );

    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.currentTimeState.set(
          this.audio.currentTime
        );
      }
    );

    this.audio.addEventListener(
      'durationchange',
      () => {
        this.durationState.set(
          Number.isFinite(
            this.audio.duration
          )
            ? this.audio.duration
            : 0
        );
      }
    );

    this.audio.addEventListener(
      'ended',
      () => {
        this.playingState.set(false);
        this.currentTimeState.set(0);
        this.audio.currentTime = 0;
      }
    );

    this.audio.addEventListener(
      'error',
      () => {
        this.loadingState.set(false);
        this.playingState.set(false);

        this.errorState.set(
          'La audioguía no está disponible en este momento.'
        );
      }
    );
  }
}