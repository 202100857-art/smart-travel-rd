import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { Place } from '../models/place.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'smart_travel_favorites';

  private readonly favoritesState = signal<Place[]>([]);
  private readonly initializedState = signal<boolean>(false);

  readonly favorites = this.favoritesState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();

  private initializationPromise?: Promise<void>;

  constructor() {
    void this.initialize();
  }

  initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.loadFavorites();
    }

    return this.initializationPromise;
  }

  async getFavorites(): Promise<Place[]> {
    await this.initialize();

    return [...this.favoritesState()];
  }

  async addFavorite(place: Place): Promise<void> {
    await this.initialize();

    const currentFavorites = this.favoritesState();

    const alreadyExists = currentFavorites.some(
      (favorite) => favorite.id === place.id
    );

    if (alreadyExists) {
      return;
    }

    const updatedFavorites: Place[] = [
      ...currentFavorites,
      {
        ...place,
        favorite: true,
      },
    ];

    await this.saveFavorites(updatedFavorites);
  }

  async removeFavorite(placeId: number): Promise<void> {
    await this.initialize();

    const updatedFavorites = this.favoritesState().filter(
      (place) => place.id !== placeId
    );

    await this.saveFavorites(updatedFavorites);
  }

  async toggleFavorite(place: Place): Promise<boolean> {
    await this.initialize();

    if (this.isFavorite(place.id)) {
      await this.removeFavorite(place.id);
      return false;
    }

    await this.addFavorite(place);
    return true;
  }

  isFavorite(placeId: number): boolean {
    return this.favoritesState().some(
      (place) => place.id === placeId
    );
  }

  async updateFavorite(updatedPlace: Place): Promise<void> {
    await this.initialize();

    const exists = this.isFavorite(updatedPlace.id);

    if (!exists) {
      throw new Error(
        'El lugar que intentas actualizar no está guardado.'
      );
    }

    const updatedFavorites = this.favoritesState().map(
      (place) =>
        place.id === updatedPlace.id
          ? {
              ...updatedPlace,
              favorite: true,
            }
          : place
    );

    await this.saveFavorites(updatedFavorites);
  }

  async clearFavorites(): Promise<void> {
    await Preferences.remove({
      key: this.storageKey,
    });

    this.favoritesState.set([]);
  }

  private async loadFavorites(): Promise<void> {
    try {
      const result = await Preferences.get({
        key: this.storageKey,
      });

      if (!result.value) {
        this.favoritesState.set([]);
        return;
      }

      const parsedValue: unknown = JSON.parse(result.value);

      if (!Array.isArray(parsedValue)) {
        throw new Error(
          'El formato almacenado de favoritos no es válido.'
        );
      }

      this.favoritesState.set(
        parsedValue as Place[]
      );
    } catch (error: unknown) {
      console.error(
        'No fue posible cargar los favoritos:',
        error
      );

      this.favoritesState.set([]);
    } finally {
      this.initializedState.set(true);
    }
  }

  private async saveFavorites(
    favorites: Place[]
  ): Promise<void> {
    await Preferences.set({
      key: this.storageKey,
      value: JSON.stringify(favorites),
    });

    this.favoritesState.set(favorites);
  }
}