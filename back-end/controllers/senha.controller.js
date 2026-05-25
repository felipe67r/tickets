import db from '../config/db.js';
import { logSenhaEmitida } from '../logger.js';

export async function emitirSenha(req, res) {
  try {
    const { tipo } = req.body; // 'SP', 'SG' ou 'SE'

    if (!tipo) {
      return res.status(400).json({ erro: 'O tipo da senha é obrigatório.' });
    }

    // Gerar código da data (YYMMDD)
    const data = new Date();
    const YY = String(data.getFullYear()).slice(2);
    const MM = String(data.getMonth() + 1).padStart(2, '0');
    const DD = String(data.getDate()).padStart(2, '0');
    const YYMMDD = `${YY}${MM}${DD}`;

    // Buscar sequência do dia para o tipo específico
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM senha WHERE tipo_codigo = ? AND data_emissao = CURDATE()`,
      [tipo]
    );

    const sequencia = (rows[0].total + 1).toString().padStart(3, '0');
    const codigo_senha = `${YYMMDD}-${tipo}${sequencia}`;

    // Inserir no banco de dados
    await db.query(
      `INSERT INTO senha (codigo_senha, tipo_codigo, data_emissao, hora_emissao) 
       VALUES (?, ?, CURDATE(), CURTIME())`,
      [codigo_senha, tipo]
    );

    logSenhaEmitida(tipo, codigo_senha);

    return res.status(201).json({
      senha: codigo_senha,
      tipo: tipo
    });

    return res.status(201).json({ senha: codigo_senha, tipo });
    
  } catch (error) {
    console.error("🔥 Erro no Controller de Senha:", error);
    return res.status(500).json({ erro: 'Erro interno ao gerar senha no banco.' });
  }
}