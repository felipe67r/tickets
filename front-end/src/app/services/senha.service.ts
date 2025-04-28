//senha.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {
  private atualizacaoSenhas = new Subject<void>();

  private apiUrl = 'http://localhost:3000/api/painel';
  private apiUrlBase = 'http://localhost:3000/api';
  isRequestInProgress: any;
  private ultimasSenhas: any[] = [];

  constructor(private http: HttpClient) { }

  limparUltimasSenhas() {
    this.ultimasSenhas = [];
  }

  getUltimasSenhas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ultimas`).pipe(
      catchError((error) => {
        console.error('Erro ao carregar últimas senhas:', error);
        return throwError(() => new Error('Erro ao carregar últimas senhas.'));
      })
    );
  }

  emitirSenha(tipo: string) {
    return this.http.post<any>(`${this.apiUrlBase}/senha/emitir`, { tipo }).pipe(
      timeout(5000),
      catchError((error) => {
        if (error.status === 0) {
          console.error('Erro de conexão com o servidor:', error);
          return throwError(() => new Error('Erro de conexão com o servidor. Verifique se ele está ativo.'));
        }
        console.error('Erro ao emitir senha:', error);
        return throwError(() => new Error('Erro ao emitir senha. Tente novamente.'));
      })
    );
  }

  getRelatorio(tipo: 'diario' | 'mensal') {
    return this.http.get<any[]>(`${this.apiUrlBase}/relatorios/${tipo}`);
  }

  notificarAtualizacao() {
    this.atualizacaoSenhas.next(); // Emitir notificação de atualização
  }

  getAtualizacaoSenhas() {
    return this.atualizacaoSenhas.asObservable(); // Retornar como observable
  }
}
