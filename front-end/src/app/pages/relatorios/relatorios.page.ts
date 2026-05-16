import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../../../environments/environment';

// Importações para geração do PDF no Frontend
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
  listaBackups: any[] = []; 
  tipoRelatorio: 'diario' | 'mensal' | 'backups' = 'diario';
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
          text: 'Agendar Backup Automatico',
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

  // --- LÓGICA DE NAVEGAÇÃO E SAÍDA ---
  logout() {
    sessionStorage.clear(); 
    this.navCtrl.navigateRoot('/login'); 
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

 async carregarRelatorio(tipo: 'diario' | 'mensal') {
    this.tipoRelatorio = tipo; 
    this.loading = true;

    this.http.get<any>(`${environment.apiUrl}/api/relatorio/${tipo}`).subscribe({
      next: (res: any) => {
        console.log('RESPOSTA DO BACKEND:', res);

        const dadosBrutos = Array.isArray(res) ? res : (res?.dados || res?.relatorio || []);

        // 1. Criamos um mapeamento padrão zerado para garantir que todos os tipos apareçam
        const categorias = {
          'Geral': { total_emitidas: 0, total_atendidas: 0 },
          'Preferencial': { total_emitidas: 0, total_atendidas: 0 },
          'Exame': { total_emitidas: 0, total_atendidas: 0 }
        };

        // 2. Percorremos os dados do banco e jogamos cada um na sua categoria correspondente
        dadosBrutos.forEach((item: any) => {
          const tipoBanco = (item.nome_tipo || item.setor || item.tipo || '').toUpperCase();
          
          // Captura os valores vindos da API precavendo qualquer nome de coluna
          const emitidas = Number(item.total_emitidas ?? item.emitidas ?? item.quantidade ?? 0);
          const atendidas = Number(item.total_atendidas ?? item.atendidas ?? item.qtd_atendidas ?? 0);

          // Verifica a sigla ou nome vindo do banco e soma no grupo certo
          if (tipoBanco === 'SG' || tipoBanco === 'GERAL') {
            categorias['Geral'].total_emitidas += emitidas;
            categorias['Geral'].total_atendidas += atendidas;
          } else if (tipoBanco === 'SP' || tipoBanco === 'PREFERENCIAL') {
            categorias['Preferencial'].total_emitidas += emitidas;
            categorias['Preferencial'].total_atendidas += atendidas;
          } else if (tipoBanco === 'SE' || tipoBanco === 'EXAME') {
            categorias['Exame'].total_emitidas += emitidas;
            categorias['Exame'].total_atendidas += atendidas;
          } else {
            // Se o banco trouxer tudo somado em uma linha só sem tipo, dividimos provisoriamente aqui para teste
            // Ou tratamos como 'Geral'
            categorias['Geral'].total_emitidas += emitidas;
            categorias['Geral'].total_atendidas += atendidas;
          }
        });

        // 3. Transformamos o objeto de categorias de volta em um Array para o *ngFor do HTML ler
        this.relatorio = Object.keys(categorias).map(key => ({
          nome_tipo: key,
          total_emitidas: categorias[key as keyof typeof categorias].total_emitidas,
          total_atendidas: categorias[key as keyof typeof categorias].total_atendidas
        }));

        console.log('DADOS SEPARADOS POR TIPO PARA A TELA:', this.relatorio);
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

  // Exportação profissional de PDF direto do array de dados
  exportarPDF() {
    try {
      const doc = new jsPDF();
      const titulo = `Sistema de Atendimento: Relatório de Senhas - ${this.tipoRelatorio === 'diario' ? 'Diário' : 'Mensal'}`;
      const dataImpressao = new Date().toLocaleString('pt-BR');

      // Cabeçalho estilizado do PDF
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(titulo.toUpperCase(), 14, 22);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Emitido em: ${dataImpressao}`, 14, 30);
      doc.line(14, 35, 196, 35); // Linha horizontal decorativa

      // Mapeando dados do array para o formato aceito pela tabela do jsPDF
      const linhasTabela = this.relatorio.map(item => [
        item.nome_tipo,
        item.total_emitidas.toString(),
        item.total_atendidas.toString()
      ]);

      // Inserindo a linha final de Totais
      linhasTabela.push([
        'TOTAL',
        this.calcularTotalEmitidas().toString(),
        this.calcularTotalAtendidas().toString()
      ]);

      // Renderizando a tabela no arquivo
      autoTable(doc, {
        startY: 40,
        head: [['Tipo de Senha', 'Emitidas', 'Atendidas']],
        body: linhasTabela,
        theme: 'striped',
        headStyles: { fillColor: [56, 128, 255] },
        didParseCell: (data) => {
          // Destaca visualmente a última linha (a de Totais)
          if (data.row.index === linhasTabela.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });

      // Baixa o arquivo gerado
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