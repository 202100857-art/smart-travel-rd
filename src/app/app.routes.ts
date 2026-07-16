import { Routes } from '@angular/router';

import {
  authGuard,
  guestGuard,
} from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/auth.page').then(
        (m) => m.AuthPage
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./tabs/tabs.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];