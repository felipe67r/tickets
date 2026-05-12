import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  // AJUSTADO: Removido o 's' de users para bater com o seu backend
  private readonly API = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  /**
   * Helper para montar os headers com o Token
   */
  private getOptions() {
    const token = sessionStorage.getItem('userToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // MÉTODO PARA CADASTRO (Signup)
  // Agora vai bater com app.post('/api/user/register', register) do seu index.js
  create(userData: any): Observable<any> {
    return this.http.post(`${this.API}/register`, userData);
  }

  // Outros métodos usando a mesma base
  updateUser(userData: any): Observable<any> {
    return this.http.put(`${this.API}/update`, userData, this.getOptions());
  }

  deleteUser(): Observable<any> {
    return this.http.delete(`${this.API}/delete`, this.getOptions());
  }
}