import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Place } from '../models/place.model';
import { FavoritesService } from '../services/favorites';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
  ],
})
export class Tab3Page {
  searchTerm = '';
  removingFavoriteId: number | null = null;

  constructor(
    public readonly favoritesService: FavoritesService
  ) {
    void this.favoritesService.initialize();
  }

  get favorites(): Place[] {
    return this.favoritesService.favorites();
  }

  get filteredFavorites(): Place[] {
    const value = this.searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return this.favorites;
    }

    return this.favorites.filter((place) =>
      [
        place.name,
        place.city,
        place.category,
        place.distance,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value)
    );
  }

  async removeFavorite(id: number): Promise<void> {
    if (this.removingFavoriteId !== null) {
      return;
    }

    this.removingFavoriteId = id;

    try {
      await this.favoritesService.removeFavorite(id);
    } catch (error: unknown) {
      console.error(
        'No fue posible eliminar el favorito:',
        error
      );
    } finally {
      this.removingFavoriteId = null;
    }
  }

  async clearAllFavorites(): Promise<void> {
    if (this.favorites.length === 0) {
      return;
    }

    try {
      await this.favoritesService.clearFavorites();
      this.clearSearch();
    } catch (error: unknown) {
      console.error(
        'No fue posible limpiar los favoritos:',
        error
      );
    }
  }

  isRemovingFavorite(id: number): boolean {
    return this.removingFavoriteId === id;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  getPlaceSymbol(category: string): string {
    switch (category.toLowerCase()) {
      case 'playa':
        return '🏖️';

      case 'naturaleza':
        return '🌳';

      case 'cultura':
        return '🏛️';

      case 'historia':
        return '🏰';

      case 'paseo':
        return '🚶';

      default:
        return '📍';
    }
  }

  getPlaceColorClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'playa':
        return 'punta-cana';

      case 'naturaleza':
        return 'botanical-garden';

      case 'cultura':
      case 'historia':
        return 'colonial-zone';

      case 'paseo':
        return 'walking-place';

      default:
        return 'default-place';
    }
  }
}