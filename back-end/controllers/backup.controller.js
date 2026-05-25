import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logBackupRealizado } from '../logger.js';

// Configuração do Banco de Dados
const dbConfig = {
  user: 'adm_db',
  password: 'admin',
  database: 'sistema'  
};

// --- CONFIGURAÇÃO DE CAMINHOS (IMPORTANTE PARA LINUX/VM) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a pasta de backups na raiz do projeto (um nível acima de controllers)
const backupDir = path.resolve(__dirname, '../backups');

// Caminho do executável no Debian (confirmado via 'which mysqldump')
const MYSQLDUMP_PATH = '/usr/bin/mysqldump';
const MYSQL_PATH = '/usr/bin/mysql';

// 1. LISTAR BACKUPS
export const listarBackups = (req, res) => {
  try {
    // Cria a pasta se ela não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = fs.readdirSync(backupDir);
    const backupList = files
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return {
          nome: file,
          tamanho: (stats.size / 1024).toFixed(2) + ' KB',
          data: stats.mtime 
        };
      })
      .sort((a, b) => b.data.getTime() - a.data.getTime()); // Mais recentes primeiro

    res.json(backupList);
  } catch (err) {
    console.error('Erro ao listar backups:', err);
    res.status(500).json({ error: "Erro ao listar arquivos de backup." });
  }
};

// 2. DOWNLOAD DE BACKUP
export const baixarBackup = (req, res) => {
  const fileName = req.params.nome;
  const filePath = path.join(backupDir, fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Arquivo não encontrado no servidor." });
  }
};

// 3. GERAR BACKUP MANUAL (E AGENDADO)
export const backupManual = (req, res) => {
  // Gera nome único com timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T');
  const fileName = `backup_${timestamp[0]}_${timestamp[1].slice(0, 5)}.sql`;
  const backupPath = path.join(backupDir, fileName);

  // Garante existência da pasta
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Comando formatado para Debian (senha entre aspas simples para evitar erro de caracteres especiais)
  const cmd = `${MYSQLDUMP_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} > "${backupPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ERRO NO PROCESSO DE BACKUP:', stderr);
      if (res) return res.status(500).json({ error: 'Falha ao gerar dump', details: stderr });
      return;
    }

    // Verificação de segurança: O ficheiro existe e tem conteúdo?
    setTimeout(() => {
      if (fs.existsSync(backupPath)) {
        console.log(`✅ Backup concluído com sucesso: ${fileName}`);
        logBackupRealizado('Sistema', fileName);
        if (res) res.status(200).json({ message: 'Backup realizado!', arquivo: fileName });
      } else {
        console.error('❌ Erro: O comando rodou mas o ficheiro não foi encontrado em:', backupPath);
        if (res) res.status(500).json({ error: 'Ficheiro não gerado no disco.' });
      }
    }, 500);
  });
};

// 4. RESTAURAR BACKUP
export const restoreBackup = (req, res) => {
  const { arquivo } = req.body;

  if (!arquivo) {
    return res.status(400).json({ error: 'Nome do arquivo não informado.' });
  }

  const filePath = path.join(backupDir, arquivo);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Ficheiro de backup não encontrado para restauro.' });
  }

  const cmd = `${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} < "${filePath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ERRO NO RESTAURO:', stderr);
      return res.status(500).json({ error: 'Erro ao restaurar banco de dados.', details: stderr });
    }
    console.log(`✅ Restauro concluído: ${arquivo}`);
    res.status(200).json({ message: 'Base de dados restaurada com sucesso!' });
  });
};

// No final do seu backup.controller.js

export const agendarHorarioManual = (req, res) => {
  const { hora, minuto, frequencia } = req.body; // frequencia: 'diario', 'semanal' ou 'mensal'
  const configPath = path.join(process.cwd(), 'config', 'agendamento.json');

  try {
    const config = { 
      hora: parseInt(hora), 
      minuto: parseInt(minuto), 
      frequencia,
      dataAtualizacao: new Date()
    };
    
    if (!fs.existsSync(path.join(process.cwd(), 'config'))) {
      fs.mkdirSync(path.join(process.cwd(), 'config'));
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    res.json({ message: `Backup configurado: ${frequencia} às ${hora}:${minuto}` });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar configuração." });
  }
};
