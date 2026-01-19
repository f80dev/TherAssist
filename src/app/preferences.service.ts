import { Injectable, signal, effect, inject, NgZone } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, DocumentReference, getDoc, FirestoreError } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Unsubscribe } from '@angular/fire/auth';

export type Theme = 'light' | 'dark';

export interface UserProfile {
  theme: Theme;
  profession: string;
}

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private zone: NgZone = inject(NgZone);
  private unsubscribeFromFirestore: Unsubscribe | null = null;

  userProfile = signal<UserProfile>({ theme: 'dark', profession: '' });

  constructor() {
    effect(() => {
      this.zone.run(async () => {
        const user = this.authService.user();
        if (user) {
          console.log('[Prefs] Utilisateur détecté:', user.uid);
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          try {
            await this.listenToProfile(userDocRef);
          } catch (error) {
            console.error('[Prefs] Erreur irrécupérable lors de l\'écoute du profil dans l\'effect:', error);
          }
        } else {
          console.log('[Prefs] Aucun utilisateur, déconnexion de Firestore.');
          if (this.unsubscribeFromFirestore) {
            this.unsubscribeFromFirestore();
          }
          this.userProfile.set({ theme: 'dark', profession: '' });
        }
      });
    });
  }

  private async listenToProfile(userDocRef: DocumentReference, retries = 3): Promise<void> {
    console.log(`[Prefs] Vérification du profil (tentatives restantes: ${retries}):`, userDocRef.path);

    try {
      // Stop any existing listener
      if (this.unsubscribeFromFirestore) {
        this.unsubscribeFromFirestore();
        this.unsubscribeFromFirestore = null;
      }

      // First, check if the document exists
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        console.log('[Prefs] Le profil n\'existe pas, création avec les valeurs par défaut.');
        const defaultProfile: UserProfile = { theme: 'dark', profession: '' };
        await setDoc(userDocRef, defaultProfile);
        this.userProfile.set(defaultProfile);
      }

      // Now, attach the listener for real-time updates
      console.log('[Prefs] Attachement du listener pour les mises à jour en temps réel.');
      this.unsubscribeFromFirestore = onSnapshot(userDocRef, (snap) => {
        this.zone.run(() => {
          if (snap.exists()) {
            const data = snap.data();
            console.log('[Prefs] Données reçues de Firestore:', data);
            this.userProfile.set({
              theme: data?.['theme'] === 'light' ? 'light' : 'dark',
              profession: data?.['profession'] || '',
            });
          } else {
            console.log('[Prefs] Le profil a été supprimé, réinitialisation aux valeurs par défaut.');
            const defaultProfile: UserProfile = { theme: 'dark', profession: '' };
            this.userProfile.set(defaultProfile);
          }
        });
      });

    } catch (e) {
      const error = e as Partial<FirestoreError>;
      if (error.code === 'unavailable' && retries > 0) {
        console.warn(`[Prefs] Client hors ligne, nouvelle tentative dans 100ms... (tentatives restantes: ${retries - 1})`);
        setTimeout(() => this.listenToProfile(userDocRef, retries - 1), 100);
      } else {
        console.error('[Prefs] Erreur irrécupérable lors de la récupération du profil:', error);
        throw error;
      }
    }
  }

  private updateProfileInFirestore(profileData: Partial<UserProfile>): void {
    const user = this.authService.user();
    if (user) {
      console.log('[Prefs] Mise à jour de Firestore avec:', profileData);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      setDoc(userDocRef, profileData, { merge: true });
    }
  }

  setTheme(theme: Theme): void {
    this.userProfile.update(profile => ({ ...profile, theme }));
    this.updateProfileInFirestore({ theme });
  }

  setProfession(profession: string): void {
    console.log(`[Prefs] Définition du métier (localement): ${profession}`);
    this.userProfile.update(profile => ({ ...profile, profession }));
    this.updateProfileInFirestore({ profession });
  }
}
