import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
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
  
  user = { email: '', password: '' };
  showPassword = false;
  passwordToggleIcon = 'eye-outline';
  isModalOpen = false;
  emailRecuperacao = '';
  returnUrl: string = '/home';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordToggleIcon = this.showPassword ? 'eye-off-outline' : 'eye-outline';
  }

  async login() {
    if (!this.user.email || !this.user.password) {
      this.mostrarToast('Por favor, preencha todos os campos.');
      return;
    }

    if (this.user.email === 'admin' && this.user.password === 'Admin@123') {
      sessionStorage.setItem('usuario', JSON.stringify({ email: 'admin' }));
      sessionStorage.setItem('usuarioLogado', 'true');
      this.navCtrl.navigateRoot(this.returnUrl);
      return;
    }

    this.http.post(`${environment.apiUrl}/api/auth/login`, this.user).subscribe({
      next: (res: any) => {
        // CORREÇÃO: Salvando o e-mail no sessionStorage para permitir deleção futura
        sessionStorage.setItem('usuario', JSON.stringify({ email: this.user.email }));
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

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) this.emailRecuperacao = '';
  }

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
          const msg = err.error?.error || 'Erro ao processar recuperação.';
          this.mostrarToast(msg);
        }
      });
  }

  criarConta() {
    this.navCtrl.navigateForward('/signup');
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}