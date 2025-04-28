import express from 'express';
import { chamarProximaSenha, encerrarAtendimento, liberarGuiche } from '../controllers/atendimento.controller.js';

const router = express.Router();

router.post('/chamar', chamarProximaSenha);
router.post('/encerrar', encerrarAtendimento);
router.post('/liberar', liberarGuiche); 

export default router;
