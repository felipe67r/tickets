import('./logger.js').then(l => {
  l.logErroAuth('teste@email.com');
  l.logLoginSucesso('teste@email.com');
  l.logCadastro('novo@email.com');
  l.logSenhaEmitida('SP', '260524-SP001');
  l.logBloqueio('bloqueado@email.com');
  console.log('Logs gerados com sucesso!');
});