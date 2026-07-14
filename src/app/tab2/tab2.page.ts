import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

import * as L from 'leaflet';

import { LocationModel } from '../models/location.model';
import { Place } from '../models/place.model';
import { FavoritesService } from '../services/favorites';
import { GeolocationService } from '../services/geolocation';
import { PlaceService } from '../services/place';

interface PlaceCategory {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private userMarker?: L.CircleMarker;
  private touristMarkersLayer?: L.LayerGroup;

  places: Place[] = [];

  searchTerm = '';
  selectedCategory = 'Todos';

  isLoadingPlaces = true;
  placesError = '';

  isLocating = false;
  locationError = '';

  favoriteActionInProgressId: number | null = null;

  toastOpen = false;
  toastMessage = '';

  currentLocation?: LocationModel;

  readonly categories: PlaceCategory[] = [
    {
      label: 'Todos',
      value: 'Todos',
      icon: '🌎',
    },
    {
      label: 'Playas',
      value: 'Playa',
      icon: '🏖️',
    },
    {
      label: 'Cultura',
      value: 'Cultura',
      icon: '🏛️',
    },
    {
      label: 'Naturaleza',
      value: 'Naturaleza',
      icon: '🌳',
    },
    {
      label: 'Historia',
      value: 'Historia',
      icon: '🏰',
    },
    {
      label: 'Paseos',
      value: 'Paseo',
      icon: '🚶',
    },
  ];

  private readonly defaultLocation: LocationModel = {
    latitude: 18.4861,
    longitude: -69.9312,
  };

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly placeService: PlaceService,
    public readonly favoritesService: FavoritesService
  ) {}

  get filteredPlaces(): Place[] {
    const searchValue = this.searchTerm
      .trim()
      .toLowerCase();

    return this.places.filter((place) => {
      const matchesCategory =
        this.selectedCategory === 'Todos' ||
        place.category === this.selectedCategory;

      const searchableText = [
        place.name,
        place.city,
        place.category,
        place.description,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }

  ngAfterViewInit(): void {
    void this.favoritesService.initialize();
    this.loadPlaces();
  }

  ionViewDidEnter(): void {
    window.setTimeout(() => {
      this.map?.invalidateSize();
    }, 150);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
    this.userMarker = undefined;
    this.touristMarkersLayer = undefined;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.refreshTouristMarkers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.refreshTouristMarkers();
  }

  onSearchChange(): void {
    this.refreshTouristMarkers();
  }

  imagePath(place: Place): string {
    return `assets/images/places/${place.image}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.style.display = 'none';

    const parent = image.parentElement;

    if (parent) {
      parent.classList.add('image-unavailable');
    }
  }

  private loadPlaces(): void {
    this.isLoadingPlaces = true;
    this.placesError = '';

    this.placeService.getPlaces().subscribe({
      next: (places: Place[]) => {
        this.places = places;
        this.isLoadingPlaces = false;

        window.setTimeout(() => {
          this.initializeMap();
        }, 150);
      },

      error: (error: unknown) => {
        console.error(
          'No fue posible cargar los lugares:',
          error
        );

        this.places = [];
        this.isLoadingPlaces = false;
        this.placesError =
          'No se pudieron cargar los lugares turísticos.';

        window.setTimeout(() => {
          this.initializeMap();
        }, 150);
      },
    });
  }

  private initializeMap(): void {
    if (this.map) {
      this.map.invalidateSize();
      this.refreshTouristMarkers();
      return;
    }

    const mapElement =
      document.getElementById('travel-map');

    if (!mapElement) {
      console.error(
        'No se encontró el contenedor travel-map.'
      );
      return;
    }

    this.map = L.map(mapElement, {
      center: [
        this.defaultLocation.latitude,
        this.defaultLocation.longitude,
      ],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }
    ).addTo(this.map);

    this.touristMarkersLayer =
      L.layerGroup().addTo(this.map);

    this.refreshTouristMarkers();

    window.setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private refreshTouristMarkers(): void {
    if (!this.map || !this.touristMarkersLayer) {
      return;
    }

    this.touristMarkersLayer.clearLayers();

    for (const place of this.filteredPlaces) {
      const marker = L.circleMarker(
        [place.latitude, place.longitude],
        {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: this.getMarkerColor(place.category),
          fillOpacity: 1,
        }
      );

      marker.bindPopup(this.getPopupContent(place));

      marker.addTo(this.touristMarkersLayer);
    }
  }

  private getPopupContent(place: Place): string {
    const imageUrl = this.imagePath(place);

    return `
      <article class="travel-map-popup">
        <img
          src="${imageUrl}"
          alt="${place.name}"
          onerror="this.style.display='none'"
        >

        <div class="travel-map-popup__content">
          <span class="travel-map-popup__category">
            ${place.category}
          </span>

          <strong>${place.name}</strong>

          <small>${place.city}</small>

          <p>${place.description}</p>

          <div class="travel-map-popup__meta">
            <span>⭐ ${place.rating}</span>
            <span>📍 ${place.distance}</span>
          </div>
        </div>
      </article>
    `;
  }

  private getMarkerColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'playa':
        return '#26c6da';

      case 'naturaleza':
        return '#43a047';

      case 'cultura':
      case 'historia':
        return '#f9a825';

      case 'paseo':
        return '#8e24aa';

      default:
        return '#1565c0';
    }
  }

  async toggleFavorite(place: Place): Promise<void> {
    if (this.favoriteActionInProgressId !== null) {
      return;
    }

    this.favoriteActionInProgressId = place.id;

    const wasFavorite =
      this.favoritesService.isFavorite(place.id);

    try {
      await this.favoritesService.toggleFavorite(place);

      this.toastMessage = wasFavorite
        ? `${place.name} fue eliminado de favoritos.`
        : `${place.name} fue agregado a favoritos.`;

      this.toastOpen = true;
    } catch (error: unknown) {
      console.error(
        'No fue posible actualizar el favorito:',
        error
      );

      this.toastMessage =
        'No fue posible actualizar el favorito.';

      this.toastOpen = true;
    } finally {
      this.favoriteActionInProgressId = null;
    }
  }

  isFavorite(placeId: number): boolean {
    return this.favoritesService.isFavorite(placeId);
  }

  isFavoriteActionInProgress(placeId: number): boolean {
    return this.favoriteActionInProgressId === placeId;
  }

  async locateUser(): Promise<void> {
    if (!this.map || this.isLocating) {
      return;
    }

    this.isLocating = true;
    this.locationError = '';

    try {
      await this.geolocationService.requestPermissions();

      const location =
        await this.geolocationService.getCurrentLocation();

      this.currentLocation = location;

      const coordinates: L.LatLngExpression = [
        location.latitude,
        location.longitude,
      ];

      if (this.userMarker) {
        this.userMarker.setLatLng(coordinates);
      } else {
        this.userMarker = L.circleMarker(
          coordinates,
          {
            radius: 10,
            color: '#ffffff',
            weight: 4,
            fillColor: '#43a047',
            fillOpacity: 1,
          }
        )
          .addTo(this.map)
          .bindPopup('<strong>Mi ubicación actual</strong>');
      }

      this.map.setView(coordinates, 16);
      this.userMarker.openPopup();
    } catch (error: unknown) {
      console.error(
        'No fue posible obtener la ubicación:',
        error
      );

      this.locationError =
        'No se pudo obtener tu ubicación. Revisa los permisos del dispositivo.';
    } finally {
      this.isLocating = false;
    }
  }

  centerOnCurrentLocation(): void {
    if (!this.map) {
      return;
    }

    if (!this.currentLocation) {
      void this.locateUser();
      return;
    }

    const coordinates: L.LatLngExpression = [
      this.currentLocation.latitude,
      this.currentLocation.longitude,
    ];

    this.map.setView(coordinates, 16);
    this.userMarker?.openPopup();
  }

  centerOnPlace(place: Place): void {
    if (!this.map) {
      return;
    }

    const coordinates: L.LatLngExpression = [
      place.latitude,
      place.longitude,
    ];

    this.map.setView(coordinates, 16);

    L.popup()
      .setLatLng(coordinates)
      .setContent(this.getPopupContent(place))
      .openOn(this.map);
  }
}