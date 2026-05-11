import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular'; // Adicionado NavController aqui
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  // Apenas um constructor com as duas injeções necessárias
  constructor(private navCtrl: NavController) {}

  ionViewWillEnter() {
    // Garante que a tela esteja destravada ao carregar
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    hiddenElements.forEach(el => el.removeAttribute('aria-hidden'));
  }

  // Função única para pular para a tela de geração de senhas (Totem)
  irParaTotem() {
    console.log('Navegando para o Totem...');
    this.navCtrl.navigateForward('/totem');
  }

  irParaAdmin() {
  // O Guard vai ver que não tem login e vai mandar para a tela de login sozinha
  this.navCtrl.navigateForward('/relatorios');
}
}