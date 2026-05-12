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
  
  // Dados de Login
  user = { 
    email: '', 
    password: '' 
  };
  
  // Controle de Visibilidade da Senha
  showPassword = false;
  passwordToggleIcon = 'eye-outline';

  // Controle do Modal de Recuperação
  isModalOpen = false;
  emailRecuperacao = '';
  
  returnUrl: string = '/home';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  /**
   * ALTERNAR VISIBILIDADE DA SENHA
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordToggleIcon = this.showPassword ? 'eye-off-outline' : 'eye-outline';
  }

  /**
   * EFETUAR LOGIN
   */
  async login() {
    if (!this.user.email || !this.user.password) {
      this.mostrarToast('Por favor, preencha todos os campos.');
      return;
    }

    // Atalho rápido para testes (opcional)
    if (this.user.email === 'admin' && this.user.password === 'Admin@123') {
      sessionStorage.setItem('usuarioLogado', 'true');
      this.navCtrl.navigateRoot(this.returnUrl);
      return;
    }

    this.http.post(`${environment.apiUrl}/api/auth/login`, this.user).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('usuarioLogado', 'true');
        if (res.token) {
          sessionStorage.setItem('userToken', res.token);
        }
        this.navCtrl.navigateRoot(this.returnUrl);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        const msg = err.error?.error || 'E-mail ou senha incorretos.';
        this.mostrarToast(msg);
      }
    });
  }

  /**
   * CONTROLE DO MODAL DE RECUPERAÇÃO
   */
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) this.emailRecuperacao = ''; // Limpa o campo ao fechar
  }

  /**
   * ENVIAR E-MAIL DE RECUPERAÇÃO (CHAMA O BACK-END)
   */
  enviarEmail() {
    if (!this.emailRecuperacao || !this.emailRecuperacao.includes('@')) {
      this.mostrarToast('Por favor, insira um e-mail válido.');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/auth/recuperar`, { email: this.emailRecuperacao })
      .subscribe({
        next: (res: any) => {
          this.mostrarToast(res.message || 'Instruções enviadas com sucesso!');
          this.setOpen(false);
        },
        error: (err) => {
          console.error('Erro na recuperação:', err);
          const msg = err.error?.error || 'E-mail não encontrado ou erro no servidor.';
          this.mostrarToast(msg);
        }
      });
  }

  // Navegação
  criarConta() {
    this.navCtrl.navigateForward('/signup');
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'dark',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}