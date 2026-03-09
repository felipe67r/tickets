import express from 'express';
import cors from 'cors';
import atendimentoRoutes from './routes/atendimento.routes.js';

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

app.get('/debug-db', (req, res) => {
  try {
    res.status(200).json({ 
      status: "Backend está vivo!",
      mensagem: "Conexão entre Windows e VM Debian estabelecida com sucesso." 
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.use('/api', atendimentoRoutes);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`==========================================`);
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse no Windows: http://192.168.0.137:${PORT}/debug-db`);
  console.log(`==========================================`);
});
