import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {

  private limparPainelSource = new Subject<void>();
  limparPainel$ = this.limparPainelSource.asObservable();
  private painelDestravado = new Subject<void>();
  public painelDestravado$ = this.painelDestravado.asObservable();
  private atualizacaoSenhas = new Subject<void>();
  private apiUrlBase = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  notificarLimpezaPainel() {
    this.limparPainelSource.next();
  }

  // AJUSTADO: Dispara o destravamento e a atualização em sequência
  notificarRestore() {
    this.painelDestravado.next();
    this.atualizacaoSenhas.next();
  }

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
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http.get<any[]>(`${this.apiUrlBase}/painel/ultimas`, { headers }).pipe(
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