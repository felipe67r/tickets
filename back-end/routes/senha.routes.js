import express from 'express';
import { emitirSenha } from '../controllers/senha.controller.js';

const router = express.Router();

router.post('/emitir', emitirSenha);

export default router;