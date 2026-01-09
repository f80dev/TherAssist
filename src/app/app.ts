import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecorderComponent } from './recorder.component';
import { QueryListComponent } from './query-list.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RecorderComponent, QueryListComponent, MatButtonModule],
  template: `
    <main>
      <h1 style="text-align: center;">Bienvenue sur {{ title() }} !</h1>
      <app-recorder></app-recorder>
      <app-query-list></app-query-list>
    </main>
    <router-outlet />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TherAssist');
}
