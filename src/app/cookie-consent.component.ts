import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
})
export class CookieConsentComponent implements OnInit {
  isVisible = false;
  private readonly consentKey = 'user-cookie-consent';

  ngOnInit(): void {
    // N'affiche le bandeau que si le consentement n'a pas déjà été donné.
    if (!localStorage.getItem(this.consentKey)) {
      this.isVisible = true;
    }
  }

  acceptConsent(): void {
    // Enregistre le consentement et cache le bandeau.
    localStorage.setItem(this.consentKey, 'true');
    this.isVisible = false;
  }
}
