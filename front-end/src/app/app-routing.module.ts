import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'totem',
    loadChildren: () => import('./pages/totem/totem.module').then(m => m.TotemPageModule)
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./pages/relatorios/relatorios.module').then(m => m.RelatoriosPageModule)
  },
  {
    path: 'atendente',
    loadChildren: () => import('./pages/atendente/atendente.module').then(m => m.AtendentePageModule)
  },
  {
    path: 'painel',
    loadChildren: () => import('./pages/painel/painel.module').then(m => m.PainelPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
