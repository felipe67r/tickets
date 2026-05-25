import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Necessário para usar __dirname com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho da pasta e arquivo de log
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'eventos.log');

// Garante que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Formata a data/hora atual no padrão brasileiro
 */
function getDataHora() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Recife' });
}

/**
 * Função principal de registro de log
 */
function registrarLog(tipo, usuario, descricao) {
  const dataHora = getDataHora();
  const linha = `[${dataHora}] ${tipo.padEnd(25)} | Usuário: ${String(usuario).padEnd(35)} | Descrição: ${descricao}\n`;
  fs.appendFileSync(LOG_FILE, linha, 'utf8');
  console.log(linha.trim());
}

// ─── Logs de Usuários ────────────────────────────────────────────────────────

export function logCadastro(usuario) {
  registrarLog('CADASTRO', usuario, 'Novo usuário cadastrado com sucesso');
}

export function logAlteracao(usuario, campo) {
  registrarLog('ALTERACAO', usuario, `Dados alterados: ${campo}`);
}

export function logExclusao(usuario) {
  registrarLog('EXCLUSAO', usuario, 'Usuário removido do sistema');
}

export function logLoginSucesso(usuario) {
  registrarLog('LOGIN_SUCESSO', usuario, 'Login realizado com sucesso');
}

export function logErroAuth(usuario) {
  registrarLog('ERRO_AUTH', usuario, 'Tentativa de login com credenciais inválidas');
}

export function logBloqueio(usuario) {
  registrarLog('BLOQUEIO', usuario, 'Usuário bloqueado por 10 minutos após 5 falhas consecutivas de autenticação');
}

// ─── Logs de Eventos da Aplicação ────────────────────────────────────────────

export function logSenhaEmitida(tipo, codigo) {
  registrarLog('SENHA_EMITIDA', 'Sistema (Totem)', `Nova senha emitida - Tipo: ${tipo} | Código: ${codigo}`);
}

export function logSenhaChamada(usuario, codigo, guiche) {
  registrarLog('SENHA_CHAMADA', usuario, `Senha ${codigo} chamada para o Guichê ${guiche}`);
}

export function logAtendimentoEncerrado(usuario) {
  registrarLog('ATENDIMENTO_ENCERRADO', usuario, 'Todas as senhas do dia foram encerradas');
}

export function logBackupRealizado(usuario, arquivo) {
  registrarLog('BACKUP_REALIZADO', usuario, `Backup gerado com sucesso: ${arquivo}`);
}

export function logRecuperacaoSenha(usuario) {
  registrarLog('RECUPERACAO_SENHA', usuario, 'Solicitação de recuperação de senha realizada');
}