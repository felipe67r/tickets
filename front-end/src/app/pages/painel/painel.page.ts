import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { SenhaService } from '../../services/senha.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule, NgFor } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.page.html',
  styleUrls: ['./painel.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PainelPage implements OnInit {
  @Input() painelLimpo!: EventEmitter<void>; 
  ultimasSenhas: any[] = [];

  constructor(private senhaService: SenhaService) {}

  ngOnInit() {
    if (this.painelLimpo) {
      this.painelLimpo.subscribe(() => {
        this.ultimasSenhas = [];
        console.log('Painel de chamadas limpo.');
      });
    }

    this.carregarUltimasSenhas(); 

    this.senhaService.getAtualizacaoSenhas().subscribe(() => {
      console.log('Recebida notificação de atualização. Recarregando senhas...');
      this.carregarUltimasSenhas(); 
    });
  }

  carregarUltimasSenhas() {
    this.senhaService.getUltimasSenhas().subscribe(
      senhas => {
        this.ultimasSenhas = senhas;
      },
      error => {
        console.error('Erro ao carregar últimas senhas:', error);
      }
    );
  }
}
