import db from '../config/db.js';

export async function emitirSenha(req, res) {
  try {
    const { tipo } = req.body;

    if (!['SP', 'SG', 'SE'].includes(tipo)) {
      console.error('Tipo de senha inválido:', tipo);
      return res.status(400).json({ erro: 'Tipo de senha inválido' });
    }

    const data = new Date();

    
    const YY = String(data.getFullYear()).slice(2);
    const MM = String(data.getMonth() + 1).padStart(2, '0');
    const DD = String(data.getDate()).padStart(2, '0');
    const YYMMDD = `${YY}${MM}${DD}`;

    
    const [result] = await db.query(`
      SELECT COUNT(*) AS total FROM senha WHERE tipo_codigo = ? AND data_emissao = CURDATE()
    `, [tipo]);

    if (!result || result.length === 0) {
      console.error('Erro ao buscar sequência no banco de dados.');
      return res.status(500).json({ erro: 'Erro ao buscar sequência no banco de dados.' });
    }

    
    const SQ = (result[0].total + 1).toString().padStart(3, '0');

    
    const codigo_senha = `${YYMMDD}-${tipo}${SQ}`;

    
    const insertResult = await db.query(`
      INSERT INTO senha (codigo_senha, tipo_codigo, data_emissao, hora_emissao)
      VALUES (?, ?, CURDATE(), CURTIME())
    `, [codigo_senha, tipo]);

    if (!insertResult) {
      console.error('Erro ao inserir senha no banco de dados.');
      return res.status(500).json({ erro: 'Erro ao inserir senha no banco de dados.' });
    }

    
    res.status(201).json({ 
      senha: codigo_senha,
      tipo 
    });
  } catch (error) {
    console.error("Erro ao emitir senha:", error);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Erro de acesso ao banco de dados. Verifique as credenciais no arquivo db.js.");
      return res.status(500).json({ erro: 'Erro de acesso ao banco de dados. Verifique as credenciais.' });
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error("Banco de dados não encontrado. Verifique se o banco de dados está criado e acessível.");
      return res.status(500).json({ erro: 'Banco de dados não encontrado. Verifique a configuração.' });
    }

    return res.status(500).json({ erro: error.message });
  }
}
