import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, Auth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './firebase.config';
import { routes } from './app.routes';

export function appInitializerFactory(auth: Auth): () => Promise<any> {
  return () => auth.authStateReady();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [Auth],
      multi: true,
    },
  ]
};
