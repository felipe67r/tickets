import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.ts';

@Injectable({
  providedIn: 'root',
})
export class AtendimentoService {
  private apiUrl = `${environment.apiUrl}/api/atendimento`;

  constructor(private http: HttpClient) {}

  chamarSenha(guiche: any): Observable<any> {
    const guicheStr = String(guiche).trim();

    if (!guicheStr) {
      console.error('Guichê não informado ou inválido.');
      return throwError(() => new Error('Guichê é obrigatório e deve ser válido.'));
    }

    return this.http.post(`${this.apiUrl}/chamar`, { guiche: guicheStr }).pipe(
      catchError((error) => {
        console.error('Erro ao chamar senha:', error);
        return throwError(() => new Error('Erro ao chamar senha.'));
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
