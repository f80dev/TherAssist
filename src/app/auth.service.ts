import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user, User } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  readonly user$: Observable<User | null> = user(this.auth);

  // Expose l'utilisateur en tant que Signal
  readonly user = toSignal(this.user$, { initialValue: null as User | null });

  loginWithGoogle(): Promise<any> {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
