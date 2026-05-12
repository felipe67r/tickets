import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home', // Agora abre direto na Home/Totem
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'totem',
    loadComponent: () => import('./pages/totem/totem.page').then(m => m.TotemPage)
  },
  {
    path: 'painel',
    loadComponent: () => import('./pages/painel/painel.page').then(m => m.PainelPage)
  },
  {
    path: 'login', // Login agora é uma página de suporte
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./pages/relatorios/relatorios.page').then(m => m.RelatoriosPage),
    canActivate: [authGuard]
  },
  {
    path: 'atendente',
    loadComponent: () => import('./pages/atendente/atendente.page').then(m => m.AtendentePage),
    
  },  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }