import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CookieConsentComponent } from './cookie-consent.component';
import { PreferencesComponent } from './preferences.component';
import { PreferencesService } from './preferences.service';
import { AuthService } from './auth.service';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    CookieConsentComponent,
    PreferencesComponent,
  ],
  template: `
    <header class="app-header">
      <h1 style="text-align: center;">{{ title() }}</h1>
      <div *ngIf="authService.user() as user; else showLogin">
        <button mat-icon-button (click)="togglePreferences()">
          <mat-icon>settings</mat-icon>
        </button>
        <button mat-button (click)="logout()">
          Déconnexion
        </button>
      </div>
      <ng-template #showLogin>
        <button mat-button routerLink="/login">
          Connexion
        </button>
      </ng-template>
    </header>

    <nav class="main-nav" *ngIf="authService.user()">
      <mat-list role="navigation">
        <mat-list-item>
          <a mat-button routerLink="/recorder">Enregistreur</a>
        </mat-list-item>
        <mat-list-item>
          <a mat-button routerLink="/queries">Queries</a>
        </mat-list-item>
      </mat-list>
    </nav>

    <main>
      <app-preferences *ngIf="showPreferences()"></app-preferences>
      <router-outlet></router-outlet>
    </main>

    <app-cookie-consent></app-cookie-consent>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TherAssist');
  protected showPreferences = signal(false);

  protected authService = inject(AuthService);
  private preferencesService = inject(PreferencesService);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const theme = this.preferencesService.theme();
      this.updateTheme(theme);
    });
  }

  togglePreferences(): void {
    this.showPreferences.set(!this.showPreferences());
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateTheme(theme: 'light' | 'dark'): void {
    const body = this.document.body;
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(`${theme}-theme`);
  }
}
