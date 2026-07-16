import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { firebaseAuth } from '../config/firebase.config';

export const authGuard: CanActivateFn =
  async () => {
    const router = inject(Router);

    await firebaseAuth.authStateReady();

    if (firebaseAuth.currentUser) {
      return true;
    }

    return router.createUrlTree(['/auth']);
  };

export const guestGuard: CanActivateFn =
  async () => {
    const router = inject(Router);

    await firebaseAuth.authStateReady();

    if (!firebaseAuth.currentUser) {
      return true;
    }

    return router.createUrlTree([
      '/tabs/tab1',
    ]);
  };