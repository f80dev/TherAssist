import { Injectable, signal, effect, inject } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Unsubscribe } from '@angular/fire/auth';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private unsubscribeFromFirestore: Unsubscribe | null = null;

  theme = signal<Theme>('dark');

  constructor() {
    // Réagit aux changements de l'utilisateur (connexion/déconnexion)
    effect(() => {
      const user = this.authService.user();

      // Si un utilisateur est connecté, écoute ses préférences
      if (user) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        this.listenToPreferences(userDocRef);
        this.saveTheme(this.theme(), userDocRef); // Sauvegarde le thème actuel
      } else {
        // Si l'utilisateur se déconnecte, arrête d'écouter les changements
        if (this.unsubscribeFromFirestore) {
          this.unsubscribeFromFirestore();
        }
        // Optionnel : réinitialiser à un thème par défaut
        this.theme.set('dark');
      }
    });
  }

  private listenToPreferences(userDocRef: DocumentReference): void {
    // Arrête l'écoute précédente pour éviter les fuites mémoire
    if (this.unsubscribeFromFirestore) {
      this.unsubscribeFromFirestore();
    }

    this.unsubscribeFromFirestore = onSnapshot(userDocRef, (snap) => {
      const data = snap.data();
      const newTheme = data && data['theme'] === 'light' ? 'light' : 'dark';
      this.theme.set(newTheme);
    });
  }

  private saveTheme(theme: Theme, userDocRef: DocumentReference): void {
    setDoc(userDocRef, { theme }, { merge: true });
  }

  // Méthode publique pour changer le thème
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    const user = this.authService.user();
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      this.saveTheme(theme, userDocRef);
    }
  }
}
