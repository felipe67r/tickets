import db from '../config/db.js';

export async function listarUltimasChamadas(req, res) {
  try {
    const [senhas] = await db.query(`
      SELECT codigo_senha, tipo_codigo, guiche_numero, hora_atendimento 
      FROM senha 
      WHERE foi_atendida = 1 
      ORDER BY data_atendimento DESC, hora_atendimento DESC 
      LIMIT 5
    `);

    const ultimasChamadas = senhas.map(senha => ({
      senha: senha.codigo_senha,
      tipo: senha.tipo_codigo,
      guiche: senha.guiche_numero,
      horaAtendimento: senha.hora_atendimento
    }));

    res.json(ultimasChamadas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar últimas senhas' });
  }
}
