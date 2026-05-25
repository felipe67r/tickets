import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import db from '../config/db.js';
import { 
  logLoginSucesso, 
  logErroAuth, 
  logBloqueio, 
  logCadastro, 
  logRecuperacaoSenha 
} from '../logger.js';

const SECRET_KEY = 'sua_chave_secreta_aqui';

// ─── CONTROLE DE FALHAS DE AUTENTICAÇÃO (Múltiplas tentativas) ──────────────
const falhasAuth = {};

function verificaBloqueio(email) {
  const registro = falhasAuth[email];
  if (!registro || !registro.bloqueadoAte) return false;
  if (new Date() < registro.bloqueadoAte) return true;
  delete falhasAuth[email];
  return false;
}

function registraFalha(email) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  if (!falhasAuth[email] || falhasAuth[email].ultimaData !== hoje) {
    falhasAuth[email] = { count: 1, ultimaData: hoje, bloqueadoAte: null };
  } else {
    falhasAuth[email].count += 1;
  }
  
  logErroAuth(email); // Loga o erro de autenticação
  
  if (falhasAuth[email].count >= 5) {
    falhasAuth[email].bloqueadoAte = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    logBloqueio(email); // Loga o bloqueio do usuário
  }
}

function limpaFalhas(email) {
  delete falhasAuth[email];
}

// ─── AUXILIARES DE SEGURANÇA DA SENHA ────────────────────────────────────────
const validarPoliticaSenha = (senha) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return regex.test(senha);
};

const gerarSenhaAleatoria = () => {
  const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let senha = '';
  senha += 'ABC'[Math.floor(Math.random() * 3)];
  senha += 'abc'[Math.floor(Math.random() * 3)];
  senha += '123'[Math.floor(Math.random() * 3)];
  senha += '!@#'[Math.floor(Math.random() * 3)];
  
  for (let i = 0; i < 6; i++) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return senha;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("--- TENTATIVA DE LOGIN ---");
  console.log("Email vindo do Front:", email);

  // 1. Verifica se a conta está temporariamente bloqueada
  if (verificaBloqueio(email)) {
    return res.status(403).json({ error: 'Usuário bloqueado por 10 minutos devido a múltiplas tentativas inválidas.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    // 2. Valida se o usuário existe
    if (rows.length === 0) {
      registraFalha(email);
      return res.status(401).json({ error: 'E-mail não encontrado.' });
    }

    const user = rows[0];
    
    // 3. Valida a senha criptografada
    const senhaValida = await bcrypt.compare(password, user.senha);
    if (!senhaValida) {
      registraFalha(email);
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // 4. Sucesso: Limpa o histórico de falhas e gera o log
    limpaFalhas(email);
    logLoginSucesso(email);

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    console.error("🔥 ERRO NO SERVIDOR EM LOGIN:", error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const { nome, email, senha } = req.body;
  
  // Validações de entrada do arquivo original
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios.' });
  if (!validarPoliticaSenha(senha)) return res.status(400).json({ error: 'Senha fraca.' });

  try {
    const [existente] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Mantido o INSERT completo com o campo 'nome'
    await db.execute('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hashedPassword]);
    
    // Dispara o log de novos cadastros
    logCadastro(email);
    
    res.status(201).json({ message: 'Registrado com sucesso!' });
  } catch (error) {
    console.error('[AUTH] Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar.' });
  }
};

// ─── RECUPERAÇÃO DE SENHA ─────────────────────────────────────────────────────
export const recuperarSenha = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'O e-mail é obrigatório.' });

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'E-mail não cadastrado.' });

    // Gera a nova senha e atualiza a segurança do banco
    const novaSenhaTemporaria = gerarSenhaAleatoria();
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(novaSenhaTemporaria, salt);

    await db.execute('UPDATE usuarios SET senha = ? WHERE email = ?', [hashedSenha, email]);

    // Configuração do Nodemailer mantida para o envio real
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jonatas2044@gmail.com',
        pass: 'iuhm biuf xkte vcyf' 
      }
    });

    const mailOptions = {
      from: '"Tickets System" <jonatas2044@gmail.com>',
      to: email,
      subject: '🔑 Sua Nova Senha de Acesso',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
          <div style="text-align: center;">
            <h1 style="color: #3880ff;">Tickets System</h1>
            <p style="color: #666;">Recuperação de Conta</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p>Olá,</p>
          <p>Sua senha foi resetada com sucesso. Utilize a senha temporária abaixo para acessar sua conta:</p>
          <div style="background: #f9f9f9; padding: 20px; font-size: 22px; font-weight: bold; text-align: center; border: 2px dashed #3880ff; color: #333; letter-spacing: 2px;">
            ${novaSenhaTemporaria}
          </div>
          <p style="color: #d9534f; font-size: 14px;"><strong>Importante:</strong> Altere esta senha imediatamente após o login.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Se você não solicitou esta alteração, entre em contato com o suporte.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    // Dispara o log de recuperação de senha do sistema
    logRecuperacaoSenha(email);
    
    console.log(`✅ Senha alterada e e-mail enviado para: ${email}`);
    res.json({ message: 'E-mail de recuperação enviado com sucesso!' });

  } catch (error) {
    console.error('[AUTH] Erro na recuperação:', error);
    res.status(500).json({ error: 'Falha ao processar recuperação.' });
  }
};