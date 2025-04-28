import db from '../config/db.js';

const estadoGuiches = new Map();
let ultimoTipoChamado = null;

export async function chamarProximaSenha(req, res) {
  const { guiche } = req.body;

  if (!guiche || typeof guiche !== 'string' || guiche.trim() === '') {
    return res.status(400).json({ erro: 'Guichê é obrigatório e deve ser uma string válida.' });
  }

  try {
    const agora = new Date();
    const tempoLiberacaoAtual = estadoGuiches.get(guiche);

    if (tempoLiberacaoAtual && tempoLiberacaoAtual > agora) {
      const tempoRestante = Math.ceil((tempoLiberacaoAtual - agora) / 60000);
      return res.status(400).json({ erro: `Guichê ainda está ocupado. Tente novamente em ${tempoRestante} minuto(s).` });
    }

    let senha = null;

    if (ultimoTipoChamado === 'SP') {
   
      const [resultSE] = await db.query(`
        SELECT codigo_senha, tipo_codigo 
        FROM senha 
        WHERE foi_atendida = 0 AND tipo_codigo = 'SE' 
        ORDER BY data_emissao ASC, hora_emissao ASC 
        LIMIT 1
      `);
      senha = resultSE.length > 0 ? resultSE[0] : null;

   
      if (!senha) {
        const [resultSG] = await db.query(`
          SELECT codigo_senha, tipo_codigo 
          FROM senha 
          WHERE foi_atendida = 0 AND tipo_codigo = 'SG' 
          ORDER BY data_emissao ASC, hora_emissao ASC 
          LIMIT 1
        `);
        senha = resultSG.length > 0 ? resultSG[0] : null;
      }
    } else {
      
      const [resultSP] = await db.query(`
        SELECT codigo_senha, tipo_codigo 
        FROM senha 
        WHERE foi_atendida = 0 AND tipo_codigo = 'SP' 
        ORDER BY data_emissao ASC, hora_emissao ASC 
        LIMIT 1
      `);
      senha = resultSP.length > 0 ? resultSP[0] : null;

      
      if (!senha) {
        const [resultSE] = await db.query(`
          SELECT codigo_senha, tipo_codigo 
          FROM senha 
          WHERE foi_atendida = 0 AND tipo_codigo = 'SE' 
          ORDER BY data_emissao ASC, hora_emissao ASC 
          LIMIT 1
        `);
        senha = resultSE.length > 0 ? resultSE[0] : null;

        
        if (!senha) {
          const [resultSG] = await db.query(`
            SELECT codigo_senha, tipo_codigo 
            FROM senha 
            WHERE foi_atendida = 0 AND tipo_codigo = 'SG' 
            ORDER BY data_emissao ASC, hora_emissao ASC 
            LIMIT 1
          `);
          senha = resultSG.length > 0 ? resultSG[0] : null;
        }
      }
    }

    if (!senha) {
      return res.status(404).json({ erro: 'Não há mais senhas para serem chamadas.' });
    }

    
    ultimoTipoChamado = senha.tipo_codigo;

    
    let tempoMedio = 0;
    if (senha.tipo_codigo === 'SP') {
      tempoMedio = 15 + (Math.random() < 0.5 ? -5 : 5);
    } else if (senha.tipo_codigo === 'SG') {
      tempoMedio = 5 + (Math.random() < 0.5 ? -3 : 3);
    } else if (senha.tipo_codigo === 'SE') {
      tempoMedio = Math.random() < 0.95 ? 1 : 5;
    }

    await db.query(`
      UPDATE senha 
      SET foi_atendida = 1, guiche_numero = ?, data_atendimento = CURDATE(), hora_atendimento = CURTIME() 
      WHERE codigo_senha = ?
    `, [guiche, senha.codigo_senha]);

    const novoTempoLiberacao = new Date(agora.getTime() + tempoMedio * 60000);
    estadoGuiches.set(guiche, novoTempoLiberacao);

    res.status(200).json({
      senha: senha.codigo_senha,
      tipo: senha.tipo_codigo,
      guiche,
      tempoMedio
    });
  } catch (error) {
    console.error('Erro ao chamar senha:', error);
    res.status(500).json({ erro: 'Erro ao chamar senha', detalhes: error.message });
  }
}

export async function encerrarAtendimento(req, res) {
  try {
    
    await db.query('DELETE FROM senha');

    res.status(200).json({ mensagem: 'Todas as senhas foram apagadas com sucesso.' });
  } catch (error) {
    console.error('Erro ao encerrar atendimento:', error);
    res.status(500).json({ erro: 'Erro ao encerrar atendimento.' });
  }
}

export async function liberarGuiche(req, res) {
  const { guiche } = req.body;

  if (!guiche || typeof guiche !== 'number') { // Ajuste para aceitar números
    return res.status(400).json({ erro: 'Guichê é obrigatório e deve ser um número válido.' });
  }

  try {
    estadoGuiches.delete(guiche.toString()); // Certifique-se de que o guichê é tratado como string
    res.status(200).json({ mensagem: `Guichê ${guiche} liberado com sucesso.` });
  } catch (error) {
    console.error('Erro ao liberar guichê:', error);
    res.status(500).json({ erro: 'Erro ao liberar guichê.' });
  }
}
