import express from 'express';
import { gerarRelatorio } from '../controllers/relatorio.controller.js';

const router = express.Router();

router.get('/:tipo', gerarRelatorio);

export default router;
