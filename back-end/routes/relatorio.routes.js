import express from 'express';
import { gerarRelatorio } from '../controllers/relatorio.controller.js';
import { backupManual, restoreBackup } from '../controllers/backup.controller.js';

const router = express.Router();

router.get('/:tipo', gerarRelatorio);
router.get('/backup/manual', backupManual);
router.post('/backup/restore', restoreBackup);

export default router;