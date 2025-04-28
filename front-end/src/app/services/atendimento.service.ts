import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AtendimentoService {
  private apiUrl = 'http://localhost:3000/api/atendimento'; // Certifique-se de que esta URL corresponde ao backend

  constructor(private http: HttpClient) {}

  chamarSenha(guiche: any): Observable<any> {
    const guicheStr = String(guiche).trim(); // Converte para string e remove espaços

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

  liberarGuiche(guiche: number): Observable<any> { // Ajuste para aceitar número
    return this.http.post(`${this.apiUrl}/liberar`, { guiche }).pipe(
      catchError((error) => {
        console.error('Erro ao liberar guichê:', error);
        return throwError(() => new Error('Erro ao liberar guichê.'));
      })
    );
  }
}
