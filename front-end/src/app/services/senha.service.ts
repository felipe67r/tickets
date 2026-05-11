import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {
  private atualizacaoSenhas = new Subject<void>();
  private apiUrlBase = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PARA O TOTEM ---

  emitirSenha(tipo: string): Observable<any> {
    // URL: http://10.10.0.138:3000/api/senha/emitir
    return this.http.post<any>(`${this.apiUrlBase}/senha/emitir`, { tipo }).pipe(
      timeout(5000),
      catchError((error) => {
        console.error('Erro ao emitir senha:', error);
        return throwError(() => new Error('Erro ao emitir senha. Verifique a conexão.'));
      })
    );
  }

  // --- MÉTODOS PARA O PAINEL ---

  getUltimasSenhas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlBase}/painel/ultimas`).pipe(
      catchError((error) => {
        console.error('Erro ao carregar últimas senhas:', error);
        return throwError(() => new Error('Erro ao carregar lista do painel.'));
      })
    );
  }

  getAtualizacaoSenhas(): Observable<void> {
    return this.atualizacaoSenhas.asObservable();
  }

  // --- MÉTODOS PARA O ATENDENTE ---

  notificarAtualizacao() {
    this.atualizacaoSenhas.next();
  }

  getRelatorio(tipo: 'diario' | 'mensal'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlBase}/relatorios/${tipo}`);
  }
}