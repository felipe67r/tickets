import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AtendentePage } from './pages/atendente/atendente.page';
import { PainelPage } from './pages/painel/painel.page';
import { RelatoriosPage } from './pages/relatorios/relatorios.page';
import { TotemPage } from './pages/totem/totem.page';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, 
    AtendentePage,
    PainelPage,
    RelatoriosPage,
    TotemPage
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
