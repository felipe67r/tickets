import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logBackupRealizado } from '../logger.js';
import db from '../config/db.js'; // Certifique-se de que o caminho do seu db.js está correto

const dbConfig = {
  user: 'adm_db',
  password: 'admin',
  database: 'sistema'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.resolve(__dirname, '../backups');
const MYSQLDUMP_PATH = '/usr/bin/mysqldump';
const MYSQL_PATH = '/usr/bin/mysql';

const garantirPastaBackup = () => {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
};

// --- FUNÇÃO AJUSTADA PARA BACKUP + LIMPEZA ---
export const finalizarExpedienteELimpar = async (req, res) => {
  garantirPastaBackup();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T');
  const fileName = `backup_final_${timestamp[0]}_${timestamp[1].slice(0, 5)}.sql`;
  const backupPath = path.join(backupDir, fileName);

  const cmd = `${MYSQLDUMP_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} > "${backupPath}"`;

  exec(cmd, async (error) => {
    if (error) {
      console.error('❌ ERRO NO BACKUP PREVENTIVO:', error);
      return res.status(500).json({ error: 'Falha ao gerar backup. Limpeza abortada.', details: error.message });
    }

    try {
      // Executa a limpeza apenas se o backup acima for bem-sucedido
      await db.query(`DELETE FROM senha`);
      console.log(`✅ Backup gerado e senhas limpas: ${fileName}`);
      logBackupRealizado('Sistema', fileName);
      res.status(200).json({ message: 'Expediente encerrado, backup realizado e base limpa com sucesso!' });
    } catch (dbError) {
      console.error('❌ ERRO NA LIMPEZA DO BANCO:', dbError);
      res.status(500).json({ error: 'Backup gerado, mas falha ao limpar tabela.', details: dbError.message });
    }
  });
};

// --- DEMAIS FUNÇÕES ORIGINAIS ---
export const listarBackups = (req, res) => {
  try {
    garantirPastaBackup();
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return { nome: file, tamanho: (stats.size / 1024).toFixed(2) + ' KB', data: stats.mtime };
      })
      .sort((a, b) => b.data.getTime() - a.data.getTime());
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar arquivos de backup." });
  }
};

export const baixarBackup = (req, res) => {
  const filePath = path.join(backupDir, req.params.nome);
  fs.existsSync(filePath) ? res.download(filePath) : res.status(404).json({ error: "Arquivo não encontrado." });
};

export const backupManual = (req, res) => {
  garantirPastaBackup();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
  const fileName = `backup_${timestamp[0]}_${timestamp[1].slice(0, 5)}.sql`;
  const backupPath = path.join(backupDir, fileName);

  const cmd = `${MYSQLDUMP_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} > "${backupPath}"`;
  exec(cmd, (error) => {
    if (error) return res.status(500).json({ error: 'Falha ao gerar dump', details: error.message });
    logBackupRealizado('Sistema', fileName);
    res.status(200).json({ message: 'Backup realizado!', arquivo: fileName });
  });
};

export const restoreBackup = (req, res) => {
  const { arquivo } = req.body;
  const filePath = path.join(backupDir, arquivo);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Ficheiro não encontrado.' });

  const cmd = `${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} < "${filePath}"`;
  exec(cmd, (error) => {
    if (error) return res.status(500).json({ error: 'Erro ao restaurar.', details: error.message });
    res.status(200).json({ message: 'Base de dados restaurada com sucesso!' });
  });
};

export const restaurarUltimoBackup = (req, res) => {
  const arquivos = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
  if (arquivos.length === 0) return res.status(404).json({ error: 'Nenhum backup encontrado.' });
  const ultimo = arquivos.map(f => ({ nome: f, path: path.join(backupDir, f), data: fs.statSync(path.join(backupDir, f)).mtime }))
    .sort((a, b) => b.data - a.data)[0];

  exec(`${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} < "${ultimo.path}"`, (error) => {
    if (error) return res.status(500).json({ error: 'Erro ao aplicar backup.', details: error.message });
    res.status(200).json({ message: 'Restauração realizada com sucesso!', arquivo: ultimo.nome });
  });
};

export const agendarHorarioManual = (req, res) => {
  const { hora, minuto, frequencia } = req.body;
  const configPath = path.join(process.cwd(), 'config', 'agendamento.json');
  if (!fs.existsSync(path.join(process.cwd(), 'config'))) fs.mkdirSync(path.join(process.cwd(), 'config'));
  fs.writeFileSync(configPath, JSON.stringify({ hora, minuto, frequencia, dataAtualizacao: new Date() }, null, 2));
  res.json({ message: `Backup configurado.` });
};

export const deletarContaUsuario = (req, res) => {
  const { email } = req.body;
  const cmd = `${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} -e "DELETE FROM usuarios WHERE email = '${email}';"`;
  exec(cmd, (error) => {
    if (error) return res.status(500).json({ error: 'Erro ao excluir.', details: error.message });
    res.status(200).json({ message: 'Conta excluída.' });
  });
};

export const limparTabelaSenhas = async (req, res) => {
  try {
    await db.query(`DELETE FROM senha`);
    console.log(`✅ Tabela de senhas limpa manualmente.`);
    res.status(200).json({ message: 'Tabela de senhas limpa com sucesso!' });
  } catch (dbError) {
    console.error('❌ ERRO NA LIMPEZA:', dbError);
    res.status(500).json({ error: 'Falha ao limpar tabela.', details: dbError.message });
  }
};