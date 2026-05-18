import https from 'https';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import atendimentoRoutes from './routes/atendimento.routes.js';
import painelRoutes from './routes/painel.routes.js';
import relatorioRoutes from './routes/relatorio.routes.js';
import senhaRoutes from './routes/senha.routes.js'; 
import { login, register, recuperarSenha, } from './controllers/auth.controller.js';
import { listarBackups, baixarBackup, backupManual, agendarHorarioManual } from './controllers/backup.controller.js';
import { iniciarAgendamento } from './config/scheduler.js';

const app = express();

app.post('/testelogin', (req, res) => {
    res.json({ message: 'Conectado ao backend!' });
});

// Configuração do CORS
app.use(cors({
  origin:  '*', // Em produção, mude para o IP do seu front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


iniciarAgendamento();

app.get('/debug-db', (req, res) => {
  res.json({ status: "Backend está vivo!", timestamp: new Date() });
});

app.get('/api/backups/lista', listarBackups);
app.get('/api/backups/download/:nome', baixarBackup);
app.post('/api/backups/manual', backupManual);
app.post('/api/backups/agendar', agendarHorarioManual);
app.use('/api/atendimento', atendimentoRoutes); 
app.use('/api/painel', painelRoutes);
app.use('/api/relatorio', relatorioRoutes);
app.use('/api/senha', senhaRoutes); 
app.post('/api/auth/login', login);
app.post('/api/auth/recuperar', recuperarSenha);
app.post('/api/user/register', register);

// Configuração da Porta
const PORT = 3000;

// Carrega os certificados SSL gerados
const sslOptions = {
  key: fs.readFileSync('/tickets-main/certs/server.key'),
  cert: fs.readFileSync('/tickets-main/certs/server.crt')
};

// Cria o servidor HTTPS usando a sintaxe nativa de ES Modules
https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log('--------------------------------------------------');
  console.log(`🔒 Servidor SEGURO rodando via HTTPS na porta ${PORT}`);
  console.log('--------------------------------------------------');
});