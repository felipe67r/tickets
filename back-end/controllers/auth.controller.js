import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js'; // Verifique se o caminho da sua conexão está correto

// CHAVE SECRETA: Use a mesma no Login e no Guard (se houver validação no back)
const SECRET_KEY = 'sua_chave_secreta_aqui';

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log("--- TENTATIVA DE LOGIN ---");
  console.log("Email vindo do Front:", email);
  console.log("Senha vinda do Front:", password ? "Recebida" : "VAZIA!");

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log("❌ Erro: Email não encontrado no banco.");
      return res.status(401).json({ error: 'E-mail não encontrado.' });
    }

    const user = rows[0];
    console.log("Usuário encontrado:", user.email);
    console.log("Hash no banco:", user.senha); // CONFIRA SE O NOME DA COLUNA É 'senha' MESMO

    // O pulo do gato: comparar
    const senhaValida = await bcrypt.compare(password, user.senha);
    console.log("A senha é válida?", senhaValida);

    if (!senhaValida) {
      console.log("❌ Erro: Senha não confere com o hash.");
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const token = jwt.sign({ id: user.id }, 'sua_chave_secreta', { expiresIn: '8h' });
    console.log("✅ Login realizado com sucesso!");
    
    res.json({ token });

  } catch (error) {
    console.error("🔥 ERRO NO SERVIDOR:", error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// --- FUNÇÃO DE REGISTRO (CRIAR CONTA) ---
export const register = async (req, res) => {
  console.log("Corpo recebido no registro:", req.body); // ISSO AQUI É A CHAVE
  const { nome, email, senha } = req.body;

  console.log(`[AUTH] Tentando registrar: ${email}`);

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Verifica se o usuário já existe
    const [existente] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // 2. Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // 3. Insere no banco (Coluna 'senha' com o Hash)
    await db.execute('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hashedPassword]);

    console.log(`[AUTH] Sucesso: Conta criada para ${email}`);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    console.error('[AUTH] Erro interno no Registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// --- FUNÇÃO DE RECUPERAÇÃO (SIMPLIFICADA) ---
export const recuperarSenha = async (req, res) => {
  const { email } = req.body;
  console.log(`[AUTH] Solicitação de recuperação para: ${email}`);

  try {
    const [rows] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'E-mail não encontrado.' });
    }

    // Aqui entraria a lógica do Nodemailer que discutimos antes.
    // Por enquanto, apenas confirmamos que o e-mail existe.
    res.json({ message: 'Se o e-mail existir em nossa base, você receberá instruções.' });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};