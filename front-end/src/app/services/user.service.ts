import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/api/user`;

  constructor(private http: HttpClient) {}

  private getOptions() {
    const token = sessionStorage.getItem('userToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  create(userData: any): Observable<any> {
    return this.http.post(`${this.API}/register`, userData);
  }

  updateUser(userData: any): Observable<any> {
    return this.http.put(`${this.API}/update`, userData, this.getOptions());
  }

  deleteUser(): Observable<any> {
  const dados = sessionStorage.getItem('usuario');
  const usuarioLogado = dados ? JSON.parse(dados) : null;
  const emailUsuario = usuarioLogado?.email; 

  if (!emailUsuario) {
    return throwError(() => new Error('E-mail não encontrado na sessão.'));
  }

  return this.http.post(`${environment.apiUrl}/api/usuarios/deletar`, { email: emailUsuario }, this.getOptions());
}
};