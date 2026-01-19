import { Injectable, signal, effect, inject } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, DocumentReference } from '@angular/fire/firestore';
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
  private unsubscribeFromFirestore: Unsubscribe | null = null;

  userProfile = signal<UserProfile>({ theme: 'dark', profession: '' });

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        console.log('[Prefs] Utilisateur détecté:', user.uid);
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        this.listenToProfile(userDocRef);
      } else {
        console.log('[Prefs] Aucun utilisateur, déconnexion de Firestore.');
        if (this.unsubscribeFromFirestore) {
          this.unsubscribeFromFirestore();
        }
        this.userProfile.set({ theme: 'dark', profession: '' });
      }
    });
  }

  private listenToProfile(userDocRef: DocumentReference): void {
    console.log('[Prefs] Écoute du profil:', userDocRef.path);
    if (this.unsubscribeFromFirestore) {
      this.unsubscribeFromFirestore();
    }
    this.unsubscribeFromFirestore = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        console.log('[Prefs] Données reçues de Firestore:', data);
        this.userProfile.set({
          theme: data?.['theme'] === 'light' ? 'light' : 'dark',
          profession: data?.['profession'] || '',
        });
      } else {
        console.log('[Prefs] Le profil n\'existe pas, création avec les valeurs par défaut.');
        const defaultProfile: UserProfile = { theme: 'dark', profession: '' };
        setDoc(userDocRef, defaultProfile);
        this.userProfile.set(defaultProfile);
      }
    });
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
