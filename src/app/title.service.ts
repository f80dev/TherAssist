import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  readonly pageTitle = signal<string>('');
}
