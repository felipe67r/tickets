import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../../../environments/environment';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  listaBackups: any[] = []; // Reintroduzido para armazenar os arquivos disponíveis
  tipoRelatorio: 'diario' | 'mensal' | 'backups' = 'diario'; // Adicionado o estado 'backups'
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController, 
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController 
  ) {}

  ngOnInit() {}

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sobre o Sistema', 
      buttons: [
        {
          text: 'Gerenciar Perfil', 
          icon: 'person-circle-outline',
          handler: () => { this.navCtrl.navigateForward('/profile'); }
        },
        {
          text: 'Gerar Backup Manual Agora',
          icon: 'cloud-download-outline',
          handler: () => { this.executarBackup(); } 
        },
        {
          text: 'Efetuar restore',
          icon: 'list-outline',
          handler: () => { this.carregarListaBackups(); }
        },
        {
          text: 'Agendar Backup Automático',
          icon: 'time-outline',
          handler: () => { this.solicitarFrequencia(); }
        },
        {
          text: 'Sair do Sistema', 
          role: 'destructive',
          icon: 'log-out-outline',
          handler: () => { this.logout(); }
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

  logout() {
    sessionStorage.clear(); 
    this.navCtrl.navigateRoot('/login'); 
  }

  async carregarListaBackups() {
    this.tipoRelatorio = 'backups';
    const loading = await this.loadingCtrl.create({ message: 'Buscando backups disponíveis...' });
    await loading.present();

    this.http.get<any[]>(`${environment.apiUrl}/api/backups/lista`).subscribe({
      next: (res) => {
        this.listaBackups = res;
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        console.error(err);
        this.mostrarToast('Erro ao carregar lista de backups.');
      }
    });
  }

  async confirmarRestore(nomeArquivo: string) {
    const alert = await this.alertCtrl.create({
      header: '⚠️ Confirmar Restore',
      message: `Você tem certeza que deseja restaurar o arquivo "${nomeArquivo}"? Os dados atuais serão apagados e substituídos por este backup.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sim, Restaurar Banco',
          handler: () => { this.executarRestore(nomeArquivo); }
        }
      ]
    });
    await alert.present();
  }

  async executarRestore(nomeArquivo: string) {
    const loading = await this.loadingCtrl.create({ message: 'Processando restauração do banco...' });
    await loading.present();

    this.http.post(`${environment.apiUrl}/api/backups/restore`, { arquivo: nomeArquivo }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.mostrarToast(res.message || 'Banco de dados restaurado com sucesso!');
        this.fecharRelatorio(); 
      },
      error: (err) => {
        loading.dismiss();
        console.error('Erro no restore:', err);
        const msg = err.error?.error || 'Erro ao aplicar o backup selecionado.';
        this.mostrarToast(msg);
      }
    });
  }

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

  async executarBackup() {
    const loading = await this.loadingCtrl.create({ message: 'Gerando Backup...' });
    await loading.present();

    this.http.post(`${environment.apiUrl}/api/backups/manual`, {}).subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Backup gerado com sucesso!');
        if (this.tipoRelatorio === 'backups') this.carregarListaBackups();
      },
      error: () => {
        loading.dismiss();
        this.mostrarToast('Erro no backup manual.');
      }
    });
  }

  async carregarRelatorio(tipo: 'diario' | 'mensal') {
    this.tipoRelatorio = tipo; 
    this.loading = true;

    this.http.get<any>(`${environment.apiUrl}/api/relatorio/${tipo}`).subscribe({
      next: (res: any) => {
        const dadosBrutos = Array.isArray(res) ? res : (res?.dados || res?.relatorio || []);

        const categories = {
          'Geral': { total_emitidas: 0, total_atendidas: 0 },
          'Preferencial': { total_emitidas: 0, total_atendidas: 0 },
          'Exame': { total_emitidas: 0, total_atendidas: 0 }
        };

        dadosBrutos.forEach((item: any) => {
          const tipoBanco = (item.nome_tipo || item.setor || item.tipo || '').toUpperCase();
          
          const emitidas = Number(item.total_emitidas ?? item.emitidas ?? item.quantidade ?? 0);
          const atendidas = Number(item.total_atendidas ?? item.atendidas ?? item.qtd_atendidas ?? 0);

          if (tipoBanco === 'SG' || tipoBanco === 'GERAL') {
            categories['Geral'].total_emitidas += emitidas;
            categories['Geral'].total_atendidas += atendidas;
          } else if (tipoBanco === 'SP' || tipoBanco === 'PREFERENCIAL') {
            categories['Preferencial'].total_emitidas += emitidas;
            categories['Preferencial'].total_atendidas += atendidas;
          } else if (tipoBanco === 'SE' || tipoBanco === 'EXAME') {
            categories['Exame'].total_emitidas += emitidas;
            categories['Exame'].total_atendidas += atendidas;
          } else {
            categories['Geral'].total_emitidas += emitidas;
            categories['Geral'].total_atendidas += atendidas;
          }
        });

        this.relatorio = Object.keys(categories).map(key => ({
          nome_tipo: key,
          total_emitidas: categories[key as keyof typeof categories].total_emitidas,
          total_atendidas: categories[key as keyof typeof categories].total_atendidas
        }));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro no relatório:', err);
        this.mostrarToast('Erro ao carregar dados.');
      }
    });
  }

  calcularTotalEmitidas(): number {
    return this.relatorio.reduce((soma, item) => soma + (item.total_emitidas || 0), 0);
  }

  calcularTotalAtendidas(): number {
    return this.relatorio.reduce((soma, item) => soma + (item.total_atendidas || 0), 0);
  }

  exportarPDF() {
    try {
      const doc = new jsPDF();
      const titulo = `Sistema de Atendimento: Relatório de Senhas - ${this.tipoRelatorio === 'diario' ? 'Diário' : 'Mensal'}`;
      const dataImpressao = new Date().toLocaleString('pt-BR');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(titulo.toUpperCase(), 14, 22);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Emitido em: ${dataImpressao}`, 14, 30);
      doc.line(14, 35, 196, 35);

      const linhasTabela = this.relatorio.map(item => [
        item.nome_tipo,
        item.total_emitidas.toString(),
        item.total_atendidas.toString()
      ]);

      linhasTabela.push([
        'TOTAL',
        this.calcularTotalEmitidas().toString(),
        this.calcularTotalAtendidas().toString()
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Tipo de Senha', 'Emitidas', 'Atendidas']],
        body: linhasTabela,
        theme: 'striped',
        headStyles: { fillColor: [56, 128, 255] },
        didParseCell: (data) => {
          if (data.row.index === linhasTabela.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });

      doc.save(`relatorio_${this.tipoRelatorio}_${new Date().getTime()}.pdf`);
      this.mostrarToast('PDF baixado com sucesso!');
    } catch (error) {
      console.error(error);
      this.mostrarToast('Erro ao gerar arquivo PDF.');
    }
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