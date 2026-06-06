import bcrypt from 'bcrypt';

// Regex: Min 10 chars, 1 Maiúscula, 1 Minúscula, 1 Número, 1 Especial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

export const store = async (req, res) => {
  const { name, email, password } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Senha não atende aos requisitos de segurança.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // Lógica para salvar no Banco de Dados aqui...
  return res.status(201).json({ message: 'Usuário criado!' });
};

export const update = async (req, res) => {
  const { name, password } = req.body;
  const userId = req.userId;

  let updateData = { name };

  if (password) {
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Nova senha fraca.' });
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  return res.json({ message: 'Dados atualizados!' });
};

// Renomeado de delete para remove
export const remove = async (req, res) => {
  const userId = req.userId;
  // Lógica para deletar do Banco aqui...
  return res.status(204).send();
};