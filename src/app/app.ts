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
      <h1>{{ title() }}</h1>
      <div *ngIf="authService.user() as user; else showLogin">
        <button mat-icon-button (click)="togglePreferences()">
          <mat-icon>settings</mat-icon>
        </button>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
      <ng-template #showLogin>
        <button mat-button routerLink="/login">
          Connexion
        </button>
      </ng-template>
    </header>

    <main>
      <app-preferences *ngIf="showPreferences()"></app-preferences>
      <router-outlet></router-outlet>
    </main>

    <nav class="main-nav" *ngIf="authService.user()">
      <a mat-icon-button routerLink="/recorder" routerLinkActive="active-link">
        <mat-icon>mic</mat-icon>
      </a>
      <a mat-icon-button routerLink="/queries" routerLinkActive="active-link">
        <mat-icon>search</mat-icon>
      </a>
    </nav>

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
      const theme = this.preferencesService.userProfile().theme;
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
    const head = this.document.head;
    const themeLink = head.querySelector('#theme-link') as HTMLLinkElement;
    const themeUrl = `assets/themes/${theme === 'dark' ? 'purple-green' : 'deeppurple-amber'}.css`;

    if (themeLink) {
      themeLink.href = themeUrl;
    } else {
      const newThemeLink = this.document.createElement('link');
      newThemeLink.id = 'theme-link';
      newThemeLink.rel = 'stylesheet';
      newThemeLink.href = themeUrl;
      head.appendChild(newThemeLink);
    }

    const body = this.document.body;
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(`${theme}-theme`);
  }
}
