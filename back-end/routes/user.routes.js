const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth'); // Seu middleware de JWT

router.post('/users', UserController.store); // Cadastro público
router.put('/users', authMiddleware, UserController.update); // Alterar dados (Logado)
router.delete('/users', authMiddleware, UserController.delete); // Excluir (Logado)

module.exports = router;