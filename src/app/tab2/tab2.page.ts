import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
} from '@angular/core';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';

import * as L from 'leaflet';

import { GeolocationService } from '../services/geolocation';
import { LocationModel } from '../models/location.model';

interface TouristPlace {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
  ],
})
export class Tab2Page implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private userMarker?: L.CircleMarker;

  isLocating = false;
  locationError = '';
  currentLocation?: LocationModel;

  private readonly defaultLocation: LocationModel = {
    latitude: 18.4861,
    longitude: -69.9312,
  };

  private readonly touristPlaces: TouristPlace[] = [
    {
      name: 'Zona Colonial',
      latitude: 18.4734,
      longitude: -69.8843,
      category: 'Cultura',
    },
    {
      name: 'Jardín Botánico Nacional',
      latitude: 18.4931,
      longitude: -69.9592,
      category: 'Naturaleza',
    },
    {
      name: 'Malecón de Santo Domingo',
      latitude: 18.4625,
      longitude: -69.9108,
      category: 'Paseo',
    },
  ];

  constructor(
    private readonly geolocationService: GeolocationService
  ) {}

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.initializeMap();
    }, 150);
  }

  ionViewDidEnter(): void {
    window.setTimeout(() => {
      this.map?.invalidateSize();
    }, 150);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  private initializeMap(): void {
    if (this.map) {
      return;
    }

    this.map = L.map('travel-map', {
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
        attribution:
          '&copy; OpenStreetMap contributors',
      }
    ).addTo(this.map);

    this.addTouristMarkers();
  }

  private addTouristMarkers(): void {
    if (!this.map) {
      return;
    }

    for (const place of this.touristPlaces) {
      L.circleMarker(
        [place.latitude, place.longitude],
        {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: '#1565c0',
          fillOpacity: 1,
        }
      )
        .addTo(this.map)
        .bindPopup(`
          <strong>${place.name}</strong><br>
          <span>${place.category}</span>
        `);
    }
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
    } catch (error) {
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

    if (this.currentLocation) {
      this.map.setView(
        [
          this.currentLocation.latitude,
          this.currentLocation.longitude,
        ],
        16
      );

      this.userMarker?.openPopup();
      return;
    }

    void this.locateUser();
  }
}