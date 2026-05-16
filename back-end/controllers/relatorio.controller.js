import db from '../config/db.js';

export async function gerarRelatorio(req, res) {
  const { tipo } = req.params;

  try {
    let query = '';

    if (tipo === 'diario') {
      // Agrupa as senhas do dia de hoje por tipo de código (SG, SP, SE)
      query = `
        SELECT
          tipo_codigo AS tipo,
          COUNT(*) AS total_emitidas,
          SUM(CASE WHEN foi_atendida IN (1, 2) THEN 1 ELSE 0 END) AS total_atendidas
        FROM senha
        WHERE data_emissao = CURDATE()
        GROUP BY tipo_codigo
      `;
    } else if (tipo === 'mensal') {
      // Agrupa as senhas do mês atual por tipo de código (SG, SP, SE)
      query = `
        SELECT
          tipo_codigo AS tipo,
          COUNT(*) AS total_emitidas,
          SUM(CASE WHEN foi_atendida IN (1, 2) THEN 1 ELSE 0 END) AS total_atendidas
        FROM senha
        WHERE MONTH(data_emissao) = MONTH(CURDATE()) 
          AND YEAR(data_emissao) = YEAR(CURDATE())
        GROUP BY tipo_codigo
      `;
    } else {
      return res.status(400).json({ erro: 'Tipo de relatório inválido.' });
    }

    const [relatorio] = await db.query(query);

    if (!relatorio || relatorio.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum dado encontrado para o período.' });
    }

    // Retorna a lista contendo as linhas separadas para o Frontend ler dinamicamente
    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório no backend:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
}