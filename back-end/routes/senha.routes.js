import express from 'express';
import { emitirSenha } from '../controllers/senha.controller.js';

const router = express.Router();

// Caminho final: /api/senha/emitir
router.post('/emitir', emitirSenha);

export default router;