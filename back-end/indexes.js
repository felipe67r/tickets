import express from 'express';
import atendimentoRoutes from './routes/atendimento.routes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import painelRoutes from './routes/painel.routes.js';
import relatorioRoutes from './routes/relatorio.routes.js';
import senhaRoutes from './routes/senha.routes.js'; 

// Imports dos Controllers de Backup
import { listarBackups, baixarBackup, backupManual, agendarHorarioManual } from './controllers/backup.controller.js';
import { iniciarAgendamento } from './config/scheduler.js';

const app = express();

// Configuração do CORS
app.use(cors({
  origin: '*', // Em produção, mude para o IP do seu front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true
}));

app.use(express.json());

// --- INICIALIZAÇÃO DO BACKUP AGENDADO ---
// Isso ativa o cron para rodar conforme configurado no scheduler.js
iniciarAgendamento();

// --- ROTAS DE DEBUG ---
app.get('/debug-db', (req, res) => {
  res.json({ status: "Backend está vivo!", timestamp: new Date() });
});

// --- ROTAS DE BACKUP (Resolvendo o Erro 404 do seu print) ---
// Note que incluí o prefixo /api manualmente aqui para bater com o seu Front-end
app.get('/api/backups/lista', listarBackups);
app.get('/api/backups/download/:nome', baixarBackup);
app.post('/api/backups/manual', backupManual);
app.post('/api/backups/agendar', agendarHorarioManual);

// --- OUTRAS ROTAS DO SISTEMA ---
// Suas rotas originais (atendimento, etc)
app.use('/api/atendimento', atendimentoRoutes);
app.use('/api/painel', painelRoutes);
app.use('/api/relatorio', relatorioRoutes);
app.use('/api/senha', senhaRoutes); 

// Configuração da Porta
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log('-------------------------------------------');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`✅ Rotas de Backup: ATIVAS (/api/backups)`);
  console.log(`⏰ Agendamento Automático: CONFIGURADO`);
  console.log('-------------------------------------------');
});