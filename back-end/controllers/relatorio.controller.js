import db from '../config/db.js';

export async function gerarRelatorio(req, res) {
  const { tipo } = req.params;
  const dataReferencia = new Date(); 

  try {
    
    let query = `
      SELECT
        COUNT(*) AS total_emitidas,
        SUM(CASE WHEN foi_atendida = 1 THEN 1 ELSE 0 END) AS total_atendidas,
        SUM(CASE WHEN tipo_codigo = 'SP' THEN 1 ELSE 0 END) AS emitidas_sp,
        SUM(CASE WHEN tipo_codigo = 'SP' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_sp,
        SUM(CASE WHEN tipo_codigo = 'SG' THEN 1 ELSE 0 END) AS emitidas_sg,
        SUM(CASE WHEN tipo_codigo = 'SG' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_sg,
        SUM(CASE WHEN tipo_codigo = 'SE' THEN 1 ELSE 0 END) AS emitidas_se,
        SUM(CASE WHEN tipo_codigo = 'SE' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_se
      FROM senha
      WHERE data_emissao = CURDATE()
    `;

    if (tipo === 'mensal') {
      query = `
        SELECT
          COUNT(*) AS total_emitidas,
          SUM(CASE WHEN foi_atendida = 1 THEN 1 ELSE 0 END) AS total_atendidas,
          SUM(CASE WHEN tipo_codigo = 'SP' THEN 1 ELSE 0 END) AS emitidas_sp,
          SUM(CASE WHEN tipo_codigo = 'SP' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_sp,
          SUM(CASE WHEN tipo_codigo = 'SG' THEN 1 ELSE 0 END) AS emitidas_sg,
          SUM(CASE WHEN tipo_codigo = 'SG' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_sg,
          SUM(CASE WHEN tipo_codigo = 'SE' THEN 1 ELSE 0 END) AS emitidas_se,
          SUM(CASE WHEN tipo_codigo = 'SE' AND foi_atendida = 1 THEN 1 ELSE 0 END) AS atendidas_se
        FROM senha
        WHERE MONTH(data_emissao) = MONTH(CURDATE()) AND YEAR(data_emissao) = YEAR(CURDATE())
      `;
    }

    const [relatorio] = await db.query(query);

    if (relatorio.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum dado encontrado para o período.' });
    }

    
    res.json(relatorio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
}
