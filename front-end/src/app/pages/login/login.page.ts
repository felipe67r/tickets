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
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class LoginPage implements OnInit {
  // Objeto que armazena os dados do formulário
  user = { email: '', password: '' };
  
  // Variável para guardar o destino pretendido antes do login
  returnUrl: string = '/home';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Quando a página carrega, verifica se o AuthGuard passou um destino no URL
    // Exemplo: /login?returnUrl=/relatorios
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  async login() {
    // 1. Validação de campos vazios
    if (!this.user.email || !this.user.password) {
      this.mostrarToast('Por favor, preencha todos os campos.');
      return;
    }

    // 2. Lógica para o ADMIN Local (Acesso rápido para testes)
    if (this.user.email === 'admin' && this.user.password === '123') {
      sessionStorage.setItem('usuarioLogado', 'true');
      console.log('Login Admin local sucesso! Redirecionando para:', this.returnUrl);
      
      // Navega para a página que o utilizador tentou aceder originalmente
      this.navCtrl.navigateRoot(this.returnUrl);
      return;
    }

    // 3. Lógica de Login via API (Servidor)
    this.http.post(`${environment.apiUrl}/api/auth/login`, this.user).subscribe({
      next: (res: any) => {
        // Guarda o estado de login para o AuthGuard e o Token para as requisições
        sessionStorage.setItem('usuarioLogado', 'true');
        sessionStorage.setItem('userToken', res.token);
        
        console.log('Login API sucesso! Redirecionando para:', this.returnUrl);
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
        { name: 'email', type: 'email', placeholder: 'Digite o seu e-mail' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: (data) => {
            if (!data.email) return false;
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

  async criarConta() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Conta',
      inputs: [
        { name: 'email', type: 'email', placeholder: 'E-mail' },
        { name: 'password', type: 'password', placeholder: 'Senha' },
        { name: 'confirmPassword', type: 'password', placeholder: 'Confirme a Senha' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cadastrar',
          handler: (data) => {
            if (!data.email || !data.password) {
              this.mostrarToast('Preencha todos os campos!');
              return false;
            }
            if (data.password !== data.confirmPassword) {
              this.mostrarToast('As senhas não coincidem!');
              return false;
            }

            this.http.post(`${environment.apiUrl}/api/auth/register`, data).subscribe({
              next: () => this.mostrarToast('Conta criada com sucesso!'),
              error: (err) => this.mostrarToast(err.error?.error || 'Erro ao criar conta.')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
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