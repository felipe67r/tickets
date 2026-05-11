import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular'; // Adicionado NavController
import { SenhaService } from '../../services/senha.service';

@Component({
  selector: 'app-totem',
  templateUrl: './totem.page.html',
  styleUrls: ['./totem.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TotemPage {
  tipoSenha: string = 'SP';
  senhaEmitida: any = null;
  erro: string = '';
  private timer: any;

  constructor(
    private senhaService: SenhaService,
    private navCtrl: NavController // Para poder voltar à Home
  ) { }

  // Executa toda vez que a página entra (resolve o erro de clique travado)
  ionViewWillEnter() {
    this.resetar();
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    hiddenElements.forEach(el => el.removeAttribute('aria-hidden'));
  }

  resetar() {
    this.senhaEmitida = null;
    this.erro = '';
    if (this.timer) clearTimeout(this.timer);
  }

  // No totem.page.ts, deixe a função assim:
  emitirSenha() { // Remova o (tipo: string) daqui
    this.senhaService.emitirSenha(this.tipoSenha).subscribe({ // Usa a variável do ngModel
      next: (res) => {
        this.senhaEmitida = {
          ...res,
         tipo: this.mapearTipoSenha(res.tipo),
        };
        this.erro = '';
      // ... resto do seu código (timer, etc)
      },
      error: (err) => {
        this.erro = 'Erro ao emitir senha.';
        this.senhaEmitida = null;
      }
    });
  }

  private mapearTipoSenha(tipo: 'SP' | 'SG' | 'SE'): string {
    const tipos: { [key in 'SP' | 'SG' | 'SE']: string } = {
      SP: 'Prioritária',
      SG: 'Geral',
      SE: 'Exame',
    };
    return tipos[tipo] || 'Normal';
  }

  voltar() {
    this.navCtrl.navigateBack('/home');
  }
}