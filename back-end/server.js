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
  res.json({ status: "Backend está vivo!" });
});

app.use('/api', atendimentoRoutes);

app.listen(3000, '0.0.0.0', () => { 
  console.log('Servidor rodando na porta 3000');
});
