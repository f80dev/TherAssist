import { Routes } from '@angular/router';
import { RecorderComponent } from './recorder.component';
import { QueryListComponent } from './query-list.component';
import { LoginComponent } from './login.component';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);

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
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'queries',
    component: QueryListComponent,
    title: 'Queries - TherAssist',
    ...canActivate(redirectUnauthorizedToLogin)
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
