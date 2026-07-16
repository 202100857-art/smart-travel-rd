import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  map,
  Observable,
  shareReplay,
  throwError,
} from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { Place } from '../models/place.model';

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  private readonly apiUrl =
    'https://generic-denial-budding.ngrok-free.dev/smart-travel-api/api/places.php';

  private placesRequest$?: Observable<Place[]>;

  constructor(
    private readonly http: HttpClient
  ) {}

  getPlaces(): Observable<Place[]> {
    if (!this.placesRequest$) {
      this.placesRequest$ = this.http
        .get<ApiResponse<Place[]>>(
          this.apiUrl,
          {
            headers: {
              Accept: 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        )
        .pipe(
          map((response: ApiResponse<Place[]>) => {
            if (!response.success) {
              throw new Error(
                response.message ||
                'La API no pudo devolver los lugares.'
              );
            }

            return response.data;
          }),

          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),

          catchError((error: unknown) => {
            console.error(
              'No fue posible consultar la API de lugares:',
              error
            );

            this.placesRequest$ = undefined;

            return throwError(
              () =>
                new Error(
                  'No se pudieron cargar los lugares desde la API.'
                )
            );
          })
        );
    }

    return this.placesRequest$;
  }

  refreshPlaces(): Observable<Place[]> {
    this.placesRequest$ = undefined;

    return this.getPlaces();
  }
}