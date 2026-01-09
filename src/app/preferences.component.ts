import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesService, Theme } from './preferences.service';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule],
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent {
  preferencesService = inject(PreferencesService);
  currentTheme = this.preferencesService.theme;

  setTheme(theme: Theme): void {
    this.preferencesService.setTheme(theme);
  }
}
