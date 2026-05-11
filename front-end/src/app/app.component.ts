import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})

export class AppComponent {
  constructor(private router: Router) {}

 exibirMenuAdmin(): boolean {
    const rotaAtual = this.router.url;
    // Esconde o menu se estiver no Login, na Home ou no Totem (público)
    const paginasPublicas = ['/login', '/home', '/totem', '/'];
    
    // Se a rota atual estiver na lista acima, retorna FALSE (esconde)
    return !paginasPublicas.includes(rotaAtual);
  }
}
