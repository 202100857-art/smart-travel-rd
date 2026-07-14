import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  Observable,
  shareReplay,
  throwError,
} from 'rxjs';

import { Place } from '../models/place.model';

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  private readonly placesUrl =
    'assets/data/places.json';

  private placesRequest$?: Observable<Place[]>;

  constructor(
    private readonly http: HttpClient
  ) {}

  getPlaces(): Observable<Place[]> {
    if (!this.placesRequest$) {
      this.placesRequest$ = this.http
        .get<Place[]>(this.placesUrl)
        .pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),
          catchError((error: unknown) => {
            console.error(
              'No fue posible cargar los lugares turísticos:',
              error
            );

            this.placesRequest$ = undefined;

            return throwError(
              () =>
                new Error(
                  'No se pudieron cargar los lugares turísticos.'
                )
            );
          })
        );
    }

    return this.placesRequest$;
  }
}