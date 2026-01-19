import { Routes } from '@angular/router';
import { RecorderComponent } from './recorder.component';
import { QueryListComponent } from './query-list.component';
import { LoginComponent } from './login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion - TherAssist'
  },
  {
    path: 'recorder',
    component: RecorderComponent,
    title: 'Enregistreur - TherAssist',
    canActivate: [authGuard]
  },
  {
    path: 'queries',
    component: QueryListComponent,
    title: 'Queries - TherAssist',
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/recorder',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/recorder'
  }
];
