import { Injectable } from '@angular/core';
import {
  Geolocation,
  PermissionStatus,
  Position,
} from '@capacitor/geolocation';

import { LocationModel } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  async requestPermissions(): Promise<PermissionStatus> {
    return Geolocation.requestPermissions();
  }

  async getCurrentLocation(): Promise<LocationModel> {
    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }
}