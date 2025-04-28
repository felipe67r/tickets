import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, NgIf, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RelatoriosPage implements OnInit {
  relatorio: any[] = [];
  tipoRelatorio: 'diario' | 'mensal' = 'diario';

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  carregarRelatorio(tipo: 'diario' | 'mensal') {
    this.tipoRelatorio = tipo; 
    this.http.get<any[]>(`http://localhost:3000/api/relatorio/${tipo}`).subscribe(
      res => {
        
        this.relatorio = res.map(item => ({
          total_emitidas: item.total_emitidas || 0,
          total_atendidas: item.total_atendidas || 0,
          emitidas_sg: item.emitidas_sg || 0,
          atendidas_sg: item.atendidas_sg || 0,
          emitidas_sp: item.emitidas_sp || 0,
          atendidas_sp: item.atendidas_sp || 0,
          emitidas_se: item.emitidas_se || 0,
          atendidas_se: item.atendidas_se || 0
        }));
      },
      error => {
        console.error('Erro ao carregar relatório:', error);
      }
    );
  }

  fecharRelatorio() {
    this.relatorio = []; 
  }
}

