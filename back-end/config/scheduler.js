import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { backupManual } from '../controllers/backup.controller.js';

export const iniciarAgendamento = () => {
  const configPath = path.join(process.cwd(), 'config', 'agendamento.json');

  cron.schedule('0 2 * * *', () => {
    console.log('⏰ [SISTEMA] Iniciando backup automático de rotina (02:00)...');
    backupManual();
  }, {
    timezone: "America/Sao_Paulo" // Garante o horário brasileiro
  });

  cron.schedule('* * * * *', () => {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath));
        const agora = new Date();

        const horaBate = agora.getHours() === parseInt(config.hora);
        const minutoBate = agora.getMinutes() === parseInt(config.minuto);

        if (horaBate && minutoBate) {
          if (config.frequencia === 'diario') {
            console.log('⏰ [APP] Backup diário agendado pelo usuário iniciado...');
            backupManual();
          } 
          else if (config.frequencia === 'semanal' && agora.getDay() === 0) { // Domingo
            console.log('⏰ [APP] Backup semanal agendado pelo usuário iniciado...');
            backupManual();
          } 
          else if (config.frequencia === 'mensal' && agora.getDate() === 1) { // Dia 1º
            console.log('⏰ [APP] Backup mensal agendado pelo usuário iniciado...');
            backupManual();
          }
        }
      } catch (e) {
        console.error("Erro ao ler agendamento dinâmico:", e);
      }
    }
  });
};