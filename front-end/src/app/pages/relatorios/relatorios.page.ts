import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, NgIf, NgFor, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe]
})
export class RelatoriosPage implements OnInit {
  relatorio: any[] = [];
  listaBackups: any[] = []; 
  tipoRelatorio: 'diario' | 'mensal' | 'backups' = 'diario';
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController, 
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Backups e Restore',
      buttons: [
        {
          text: 'Restaurar e baixar backups',
          icon: 'list-outline',
          handler: () => { this.carregarListaBackups(); }
        },
        {
          text: 'Gerar Backup Manual Agora',
          icon: 'cloud-download-outline',
          handler: () => { this.executarBackup(); } 
        },
        {
          text: 'Configurar Automação (Frequência)',
          icon: 'time-outline',
          handler: () => { this.solicitarFrequencia(); } // Mudança aqui
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  // --- NOVO FLUXO DE AGENDAMENTO ---

  async solicitarFrequencia() {
    const alert = await this.alertCtrl.create({
      header: 'Frequência do Backup',
      inputs: [
        { type: 'radio', label: 'Diariamente', value: 'diario', checked: true },
        { type: 'radio', label: 'Semanalmente (Domingos)', value: 'semanal' },
        { type: 'radio', label: 'Mensalmente (Dia 1º)', value: 'mensal' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Próximo',
          handler: (frequencia) => {
            this.solicitarHorarioAgendamento(frequencia);
          }
        }
      ]
    });
    await alert.present();
  }

  async solicitarHorarioAgendamento(frequencia: string) {
    const alert = await this.alertCtrl.create({
      header: 'Definir Horário',
      subHeader: `Backup ${frequencia}`,
      inputs: [
        { name: 'hora', type: 'number', placeholder: 'Hora (0-23)', min: 0, max: 23 },
        { name: 'minuto', type: 'number', placeholder: 'Minuto (0-59)', min: 0, max: 59 }
      ],
      buttons: [
        { text: 'Voltar', handler: () => { this.solicitarFrequencia(); } },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.hora === '' || data.minuto === '') {
              this.mostrarToast('Preencha o horário!');
              return false;
            }
            this.enviarAgendamento(data.hora, data.minuto, frequencia);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  enviarAgendamento(hora: number, minuto: number, frequencia: string) {
    this.http.post(`${environment.apiUrl}/api/backups/agendar`, { hora, minuto, frequencia }).subscribe({
      next: (res: any) => this.mostrarToast(res.message || 'Configuração salva!'),
      error: () => this.mostrarToast('Erro ao salvar agendamento.')
    });
  }

  // --- LÓGICA DE BACKUP MANUAL E DOWNLOAD ---

  async carregarListaBackups() {
    this.tipoRelatorio = 'backups';
    const loading = await this.loadingCtrl.create({ message: 'Buscando lista...' });
    await loading.present();

    this.http.get<any[]>(`${environment.apiUrl}/api/backups/lista`).subscribe({
      next: (res) => {
        this.listaBackups = res;
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.mostrarToast('Erro ao carregar lista.');
      }
    });
  }

  async executarBackup() {
    const loading = await this.loadingCtrl.create({ message: 'Gerando Backup...' });
    await loading.present();

    this.http.post(`${environment.apiUrl}/api/backups/manual`, {}).subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Backup gerado!');
        if (this.tipoRelatorio === 'backups') this.carregarListaBackups();
      },
      error: () => {
        loading.dismiss();
        this.mostrarToast('Erro no backup manual.');
      }
    });
  }

  baixarArquivo(nomeArquivo: string) {
    const url = `${environment.apiUrl}/api/backups/download/${nomeArquivo}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // --- LÓGICA DE RELATÓRIOS ---

  carregarRelatorio(tipo: 'diario' | 'mensal') {
    this.tipoRelatorio = tipo; 
    this.http.get<any[]>(`${environment.apiUrl}/api/relatorio/${tipo}`).subscribe({
      next: (res) => {
        this.relatorio = res.map(item => ({
          total_emitidas: item.total_emitidas || 0,
          total_atendidas: item.total_atendidas || 0,
        }));
      },
      error: () => this.mostrarToast('Erro no relatório.')
    });
  }

  fecharRelatorio() {
    this.relatorio = []; 
    this.listaBackups = [];
    this.tipoRelatorio = 'diario';
  }

  async mostrarToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}