import express from 'express';
import atendimentoRoutes from './routes/atendimento.routes.js';

const app = express();

app.use(express.json());

app.use(atendimentoRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});