import express from 'express';
import atendimentoRoutes from './routes/atendimento.routes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import painelRoutes from './routes/painel.routes.js';
import relatorioRoutes from './routes/relatorio.routes.js';
import senhaRoutes from './routes/senha.routes.js'; 

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use('/api/atendimento', atendimentoRoutes); 
app.use('/api/painel', painelRoutes);
app.use('/api/relatorio', relatorioRoutes);
app.use('/api/senha', senhaRoutes); 


app.get('/', (req, res) => {
  res.send('API Controle de Atendimento está rodando!');
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
