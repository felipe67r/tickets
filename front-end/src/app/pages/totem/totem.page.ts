import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SenhaService } from '../../services/senha.service';

@Component({
  selector: 'app-totem',
  templateUrl: './totem.page.html',
  styleUrls: ['./totem.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TotemPage implements OnInit {
  tipoSenha: string = 'SP';
  senhaEmitida: any;
  erro: string = '';
  private timer: any;

  constructor(private senhaService: SenhaService) { }

  ngOnInit() {
  }

  emitirSenha() {
    this.senhaService.emitirSenha(this.tipoSenha).subscribe({
      next: (res) => {
        this.senhaEmitida = {
          ...res,
          tipo: this.mapearTipoSenha(res.tipo),
        };
        this.erro = '';

        if (this.timer) {
          clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
          this.senhaEmitida = null; 
        }, 10000);
      },
      error: (err) => {
        this.erro = err.message || 'Erro ao emitir senha. Tente novamente.';
        this.senhaEmitida = null;
        console.error('Erro ao emitir senha:', err);
      }
    });
  }

  private mapearTipoSenha(tipo: 'SP' | 'SG' | 'SE'): string {
    const tipos: { [key in 'SP' | 'SG' | 'SE']: string } = {
      SP: 'Senha Prioritária',
      SG: 'Senha Geral',
      SE: 'Senha Exame',
    };
    return tipos[tipo];
  }
}

