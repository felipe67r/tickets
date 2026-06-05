import { Component, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AtendimentoService } from '../../services/atendimento.service';
import { SenhaService } from '../../services/senha.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-atendente',
  templateUrl: './atendente.page.html',
  styleUrls: ['./atendente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AtendentePage implements OnInit {
  guiche: string = '';
  senhasChamadas: any[] = []; 
  erroMensagem: string | null = null;
  painelLimpo = new EventEmitter<void>();
  atendimentoTimers: { [key: string]: any } = {}; 
  tempoRestante: string = '00:00'; 
  blocoVisivel: boolean = false;

  constructor(
    private atendimentoService: AtendimentoService,
    private senhaService: SenhaService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {}

  // ... (mantive seus métodos anteriores inalterados) ...

  chamarProxima() {
    if (!this.guiche) {
      console.error('Guichê não informado.');
      this.erroMensagem = 'Guichê é obrigatório.';
      return;
    }

    const dadosRequisicao = { guiche: this.guiche };

    this.atendimentoService.chamarSenha(dadosRequisicao).subscribe({
      next: (res) => {
        this.senhasChamadas.unshift({ ...res, tempoRestante: '00:00' }); 
        this.erroMensagem = null;
        this.senhaService.notificarAtualizacao();
        this.iniciarAtendimentoTimer(res.senha);
      },
      error: (err) => {
        this.erroMensagem = err.error?.message || err.message || 'Erro ao chamar senha.';
        console.error('Erro ao chamar senha:', err);
      }
    });
  }


  // ... (restante dos seus métodos: iniciarAtendimentoTimer, pausarAtendimento, calcularTempoMedio, formatarTempo, etc., permanecem iguais) ...

  iniciarAtendimentoTimer(senha: string) {
    if (this.atendimentoTimers[senha]) clearInterval(this.atendimentoTimers[senha]);
    const senhaChamada = this.senhasChamadas.find(s => s.senha === senha);
    if (!senhaChamada) return;
    const tipo = senhaChamada.tipo;
    const tempoTotal = this.calcularTempoMedio(tipo);
    let tempoAtual = 0;
    this.atendimentoTimers[senha] = setInterval(() => {
      if (tempoAtual < tempoTotal) {
        tempoAtual++;
        senhaChamada.tempoRestante = this.formatarTempo(tempoAtual);
      } else {
        this.pausarAtendimento(senha);
      }
    }, 1000);
  }

  pausarAtendimento(senha: string) {
    clearInterval(this.atendimentoTimers[senha]);
    delete this.atendimentoTimers[senha];
    setTimeout(() => { this.senhasChamadas = this.senhasChamadas.filter(s => s.senha !== senha); }, 5000);
  }

  calcularTempoMedio(tipo: string): number {
    if (tipo === 'SP') return 15 * 60 + (Math.random() < 0.5 ? -5 * 60 : 5 * 60);
    if (tipo === 'SG') return 5 * 60 + (Math.random() < 0.5 ? -3 * 60 : 3 * 60); 
    if (tipo === 'SE') return Math.random() < 0.95 ? 60 : 5 * 60; 
    return 0;
  }

  formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${this.adicionarZero(minutos)}:${this.adicionarZero(segundosRestantes)}`;
  }

  adicionarZero(valor: number): string {
    return valor < 10 ? `0${valor}` : `${valor}`;
  }

  finalizarAtendimento(senha: string) {
    if (this.atendimentoTimers[senha]) {
      clearInterval(this.atendimentoTimers[senha]);
      delete this.atendimentoTimers[senha]; 
    }
    const senhaData = this.senhasChamadas.find(s => s.senha === senha);
    if (!senhaData) return;
    const guiche = senhaData.guiche;
    this.senhasChamadas = this.senhasChamadas.filter(s => s.senha !== senha);
    this.atendimentoService.liberarGuiche(Number(guiche)).subscribe({
      next: () => console.log(`Guichê ${guiche} liberado.`),
      error: (err) => console.error('Erro:', err),
    });
  }


  async finalizarExpediente() {
    if (confirm('Deseja realmente limpar as senhas e encerrar o expediente?')) {
      try {
        await firstValueFrom(this.atendimentoService.limparTabela());
        
        // Limpa localmente para o atendente não ver mais senhas chamadas
        this.senhasChamadas = [];
        this.atendimentoTimers = {}; 
        
        // Notifica o painel (caso esteja na mesma aba)
        this.senhaService.notificarLimpezaPainel();
        
        alert('Expediente encerrado com sucesso!');
      } catch (err) {
        console.error('Erro no processo:', err);
        alert('Erro ao processar. Verifique o servidor.');
      }
    }
  }
}