import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// Adicionamos o ToastController para dar um feedback visual
import { IonicModule, NavController, ToastController } from '@ionic/angular'; 
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,FormsModule, ReactiveFormsModule]
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private navCtrl: NavController,
    private toastCtrl: ToastController // Injetado para a mensagem de sucesso
  ) {}

  ngOnInit() {
  this.signupForm = this.fb.group({
    nome: ['', [Validators.required]], 
    email: ['', [Validators.required, Validators.email]],
    // Atualizado com a nova Regex da política de senha
    senha: ['', [
      Validators.required, 
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
    ]]
  });
}

  async onSubmit() {
    if (this.signupForm.valid) {
      const dadosUsuario = this.signupForm.value;
      
      this.userService.create(dadosUsuario).subscribe({
        next: async (res) => {
          // 1. Cria a mensagem de sucesso
          const toast = await this.toastCtrl.create({
            message: 'Conta criada com sucesso! Faça seu login.',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          
          // 2. Mostra a mensagem
          toast.present();

          // 3. MANDA DE VOLTA PARA O LOGIN
          // O navigateRoot limpa o histórico e define a nova página como principal
          this.navCtrl.navigateRoot('/login');
        },
        error: async (err) => {
          console.error('Erro ao cadastrar:', err);
          const toast = await this.toastCtrl.create({
            message: 'Erro ao criar conta. Tente novamente.',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      });
    }
  }
}