import express from 'express';
import { chamarProximaSenha, encerrarAtendimento, liberarGuiche } from '../controllers/atendimento.controller.js';
import { limparTabelaSenhas } from '../controllers/backup.controller.js';

const router = express.Router();

router.post('/chamar', chamarProximaSenha);
router.post('/encerrar', encerrarAtendimento);
router.post('/acao/limpar-banco', limparTabelaSenhas);
router.post('/liberar', liberarGuiche); 

export default router;
