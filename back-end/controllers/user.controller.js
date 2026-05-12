const bcrypt = require('bcrypt');

// Regex: Min 8 chars, 1 Maiúscula, 1 Minúscula, 1 Número, 1 Especial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

module.exports = {
  async store(req, res) {
    const { name, email, password } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Senha não atende aos requisitos de segurança.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Lógica para salvar no Banco de Dados aqui...
    return res.status(201).json({ message: 'Usuário criado!' });
  },

  async update(req, res) {
    const { name, password } = req.body;
    const userId = req.userId; // Vem do middleware de auth

    let updateData = { name };

    if (password) {
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Nova senha fraca.' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Lógica para atualizar no Banco aqui...
    return res.json({ message: 'Dados atualizados!' });
  },

  async delete(req, res) {
    const userId = req.userId;
    // Lógica para deletar do Banco aqui...
    return res.status(204).send();
  }
};