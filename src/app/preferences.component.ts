import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesService, Theme } from './preferences.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent {
  preferencesService = inject(PreferencesService);
  userProfile = this.preferencesService.userProfile;

  readonly professions = ['Project Manager', 'Psyco-praticien'];

  setTheme(theme: Theme): void {
    this.preferencesService.setTheme(theme);
  }

  setProfession(profession: string): void {
    this.preferencesService.setProfession(profession);
  }
}
