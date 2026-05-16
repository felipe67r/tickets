import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AtendimentoService {
  private apiUrl = `${environment.apiUrl}/api/atendimento`;

  constructor(private http: HttpClient) {}

  chamarSenha(guiche: any): Observable<any> {
    let guicheStr = '';

    // Verifica se o que foi passado é um objeto (ex: { guiche: '1' }) ou uma string/número direto
    if (guiche && typeof guiche === 'object' && guiche.guiche) {
      guicheStr = String(guiche.guiche).trim();
    } else {
      guicheStr = String(guiche).trim();
    }

    // Validação de segurança se o guichê vier em branco ou der erro de conversão
    if (!guicheStr || guicheStr === '[object Object]') {
      console.error('Guichê não informado ou inválido.');
      return throwError(() => new Error('Guichê é obrigatório e deve ser válido.'));
    }

    // Agora o JSON vai envelopado perfeitamente para o backend
    return this.http.post(`${this.apiUrl}/chamar`, { guiche: guicheStr }).pipe(
      catchError((error) => {
        console.error('Erro detalhado retornado pelo servidor:', error);
        
        // Melhora a mensagem de erro capturando o que o backend respondeu de fato
        const msgErro = error.error?.message || 'Erro ao chamar senha.';
        return throwError(() => new Error(msgErro));
      })
    );
  }

  encerrarExpediente(): Observable<any> {
    return this.http.post(`${this.apiUrl}/encerrar`, {});
  }

  liberarGuiche(guiche: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/liberar`, { guiche }).pipe(
      catchError((error) => {
        console.error('Erro ao liberar guichê:', error);
        return throwError(() => new Error('Erro ao liberar guichê.'));
      })
    );
  }
}
