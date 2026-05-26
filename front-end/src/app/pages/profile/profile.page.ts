import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Adicionado
import { FormsModule } from '@angular/forms'; // Adicionado para o ngModel funcionar
import { IonicModule, AlertController, ToastController, NavController } from '@ionic/angular'; // IonicModule adicionado aqui
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule
  ]
})
export class ProfilePage implements OnInit {
  
  public user = {
    name: '',
    email: '',
    password: '' 
  };

  constructor(
    private alertController: AlertController,
    private userService: UserService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Exemplo: this.userService.getProfile().subscribe(data => this.user = data);
  }

  async updateAccount() {
    this.userService.updateUser(this.user).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Dados atualizados com sucesso!',
          duration: 2000,
          color: 'success'
        });
        toast.present();
      },
      error: async (err) => {
        console.error(err);
      }
    });
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Atenção!',
      message: 'Deseja realmente excluir sua conta? Esta ação é irreversível.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  private deleteAccount() {
  this.userService.deleteUser().subscribe({
    next: async () => {
      const toast = await this.toastController.create({
        message: 'Sua conta foi excluída com sucesso.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      sessionStorage.clear(); 
      this.navCtrl.navigateRoot('/login'); 
    },
    error: async (err) => {
      console.error('Erro ao excluir conta', err);
      
      const toast = await this.toastController.create({
        message: err.error?.error || 'Não foi possível excluir sua conta no momento.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  });
}
}