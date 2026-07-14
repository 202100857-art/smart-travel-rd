import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NetworkService } from '../services/network';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
  ],
})
export class Tab1Page {
  constructor(
    public readonly networkService: NetworkService
  ) {}
}