import express from 'express';
import cors from 'cors';
import atendimentoRoutes from './routes/atendimento.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/debug-db', async (req, res) => {
  try {
    res.send({ status: "Backend está vivo!" });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.use(atendimentoRoutes);
app.listen(3000, '0.0.0.0', () => { 
  console.log('Server is running on port 3000');
});
