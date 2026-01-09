import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Connexion</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Veuillez vous connecter pour continuer.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="login()">
          Se connecter avec Google
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async login(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur de connexion :', error);
    }
  }
}
