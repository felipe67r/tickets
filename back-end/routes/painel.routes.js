import express from 'express';
import { listarUltimasChamadas } from '../controllers/painel.controller.js';

const router = express.Router();

router.get('/ultimas', listarUltimasChamadas);

export default router;
