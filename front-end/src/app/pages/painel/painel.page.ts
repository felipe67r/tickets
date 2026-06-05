import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
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
export class PainelPage implements OnInit, OnDestroy {
  ultimasSenhas: any[] = [];
  private emProcessoDeLimpeza: boolean = false; 
  private intervalId: any; // Armazena o ID do temporizador

  constructor(
    private senhaService: SenhaService,
    private cdr: ChangeDetectorRef 
  ) {}

    ngOnInit() {
    // 1. Escuta a limpeza (deixa como está)
    this.senhaService.limparPainel$.subscribe(() => {
      this.emProcessoDeLimpeza = true;
      this.ultimasSenhas = [];
      this.cdr.detectChanges();
    });

    // 2. Novo: Escuta mudanças no LocalStorage para destravar
    window.addEventListener('storage', (event) => {
      if (event.key === 'painel_destravado' && event.newValue === 'true') {
        this.emProcessoDeLimpeza = false; // Destrava
        localStorage.removeItem('painel_destravado'); // Limpa o aviso
        this.carregarUltimasSenhas(); // Recarrega
      }
    });

    // 3. Polling (mantenha como está)
    this.intervalId = setInterval(() => {
      if (!this.emProcessoDeLimpeza) {
        this.carregarUltimasSenhas();
      }
    }, 3000);
  }

  ngOnDestroy() {
    // Limpa o intervalo ao sair da página para evitar vazamento de memória
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  carregarUltimasSenhas() {
    this.senhaService.getUltimasSenhas().subscribe({
      next: (senhas) => { 
        // Compara o conteúdo para evitar re-renderização desnecessária
        if (JSON.stringify(this.ultimasSenhas) !== JSON.stringify(senhas)) {
          this.ultimasSenhas = senhas || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erro ao carregar senhas:', err)
    });
  }
}