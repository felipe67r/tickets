import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logBackupRealizado } from '../logger.js';

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

export const listarBackups = (req, res) => {
  try {
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

export const baixarBackup = (req, res) => {
  const fileName = req.params.nome;
  const filePath = path.join(backupDir, fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Arquivo não encontrado no servidor." });
  }
};

export const backupManual = (req, res) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T');
  const fileName = `backup_${timestamp[0]}_${timestamp[1].slice(0, 5)}.sql`;
  const backupPath = path.join(backupDir, fileName);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const cmd = `${MYSQLDUMP_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} > "${backupPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ERRO NO PROCESSO DE BACKUP:', stderr);
      if (res) return res.status(500).json({ error: 'Falha ao gerar dump', details: stderr });
      return;
    }

    setTimeout(() => {
      if (fs.existsSync(backupPath)) {
        console.log(`✅ Backup concluído com sucesso: ${fileName}`);
        logBackupRealizado('Sistema', fileName);
        if (res) res.status(200).json({ message: 'Backup realizado!', arquivo: fileName });
      } else {
        console.error('❌ Erro: Ficheiro não encontrado em:', backupPath);
        if (res) res.status(500).json({ error: 'Ficheiro não gerado no disco.' });
      }
    }, 500);
  });
};

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

export const restaurarUltimoBackup = (req, res) => {
  try {
    // Garante que a pasta existe antes de tentar ler
    if (!fs.existsSync(backupDir)) {
      return res.status(404).json({ error: 'Nenhum backup encontrado (pasta inexistente).' });
    }

    const arquivos = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql'));

    if (arquivos.length === 0) {
      return res.status(404).json({ error: 'Nenhum arquivo de backup (.sql) encontrado para restauração.' });
    }

    const backupsOrdenados = arquivos
      .map(file => {
        return {
          nome: file,
          caminhoCompleto: path.join(backupDir, file),
          dataAlteracao: fs.statSync(path.join(backupDir, file)).mtime
        };
      })
      .sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime()); // O mais recente fica na posição [0]

    const ultimoBackup = backupsOrdenados[0];
    console.log(`🔄 Iniciando restauração automática do último backup: ${ultimoBackup.nome}`);

    const cmd = `${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} < "${ultimoBackup.caminhoCompleto}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ ERRO NA RESTAURAÇÃO AUTOMÁTICA:', stderr);
        return res.status(500).json({ error: 'Erro ao aplicar o último backup.', details: stderr });
      }
      
      console.log(`✅ Banco de dados atualizado com sucesso para a versão de: ${ultimoBackup.nome}`);
      res.status(200).json({ 
        message: 'O último backup disponível foi restaurado com sucesso!', 
        arquivoAplicado: ultimoBackup.nome 
      });
    });

  } catch (err) {
    console.error('🔥 Erro crítico na restauração automática:', err);
    res.status(500).json({ error: 'Erro interno ao processar a busca do último backup.' });
  }
};

export const agendarHorarioManual = (req, res) => {
  const { hora, minuto, frequencia } = req.body; 
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

export const deletarContaUsuario = (req, res) => {
  const { email } = req.body; // Mudamos de id para email

  if (!email) {
    return res.status(400).json({ error: 'E-mail do usuário não foi informado.' });
  }

  const querySql = `DELETE FROM usuarios WHERE email = '${email}';`;

  const cmd = `${MYSQL_PATH} -u ${dbConfig.user} -p'${dbConfig.password}' ${dbConfig.database} -e "${querySql}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ERRO AO DELETAR:', stderr);
      return res.status(500).json({ error: 'Erro ao excluir conta.', details: stderr });
    }
    
    console.log(`🗑️ Conta com e-mail ${email} deletada com sucesso.`);
    res.status(200).json({ message: 'Sua conta foi excluída com sucesso.' });
  });
};