import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  // IMPORTANTE: HttpClientModule deve estar aqui para o HttpClient funcionar em componentes standalone
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class LoginPage implements OnInit {
  
  // Objeto com os mesmos nomes usados no seu HTML (email e password)
  user = { 
    email: '', 
    password: '' 
  };
  
  returnUrl: string = '/home';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Captura o destino caso o AuthGuard tenha redirecionado para cá
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  async login() {
    // 1. Validação simples
    if (!this.user.email || !this.user.password) {
      this.mostrarToast('Por favor, preencha todos os campos.');
      return;
    }

    // 2. Atalho para testes (Admin)
    if (this.user.email === 'admin' && this.user.password === '123') {
      sessionStorage.setItem('usuarioLogado', 'true');
      this.navCtrl.navigateRoot(this.returnUrl);
      return;
    }

    // 3. Login oficial via API
    this.http.post(`${environment.apiUrl}/api/auth/login`, this.user).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('usuarioLogado', 'true');
        // Se a sua API retornar um token, guardamos aqui
        if (res.token) {
          sessionStorage.setItem('userToken', res.token);
        }
        
        this.navCtrl.navigateRoot(this.returnUrl);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.mostrarToast('E-mail ou senha incorretos.');
      }
    });
  }

  async recuperarSenha() {
    const alert = await this.alertCtrl.create({
      header: 'Recuperar Senha',
      subHeader: 'Enviaremos um código para o seu e-mail',
      inputs: [
        { 
          name: 'email', 
          type: 'email', 
          placeholder: 'Digite o seu e-mail' 
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: (data) => {
            if (!data.email) {
              this.mostrarToast('Digite um e-mail válido.');
              return false;
            }
            this.http.post(`${environment.apiUrl}/api/auth/recuperar`, { email: data.email }).subscribe({
              next: () => this.mostrarToast('E-mail de recuperação enviado!'),
              error: () => this.mostrarToast('E-mail não encontrado.')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Navega para a tela de cadastro
  criarConta() {
    this.navCtrl.navigateForward('/signup');
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}