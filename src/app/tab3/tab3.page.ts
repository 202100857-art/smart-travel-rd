import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
   IonTitle,
  IonToolbar, } from '@ionic/angular/standalone';

interface FavoritePlace {
  id: number;
  name: string;
  location: string;
  category: string;
  rating: number;
  distance: string;
  symbol: string;
  colorClass: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonTitle, 
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

  favorites: FavoritePlace[] = [
    {
      id: 1,
      name: 'Punta Cana',
      location: 'La Altagracia',
      category: 'Playa',
      rating: 4.9,
      distance: '198 km',
      symbol: '🌴',
      colorClass: 'punta-cana',
    },
    {
      id: 2,
      name: 'Zona Colonial',
      location: 'Santo Domingo',
      category: 'Cultura',
      rating: 4.8,
      distance: '2.4 km',
      symbol: '🏛️',
      colorClass: 'colonial-zone',
    },
    {
      id: 3,
      name: 'Jardín Botánico',
      location: 'Distrito Nacional',
      category: 'Naturaleza',
      rating: 4.7,
      distance: '6.8 km',
      symbol: '🌳',
      colorClass: 'botanical-garden',
    },
  ];

  get filteredFavorites(): FavoritePlace[] {
    const value = this.searchTerm.trim().toLowerCase();

    if (!value) {
      return this.favorites;
    }

    return this.favorites.filter((place) =>
      `${place.name} ${place.location} ${place.category}`
        .toLowerCase()
        .includes(value)
    );
  }

  removeFavorite(id: number): void {
    this.favorites = this.favorites.filter((place) => place.id !== id);
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}