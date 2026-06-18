const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilizador } = require('../models');
const { registar_log } = require('./logController');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const utilizador = await Utilizador.findOne({ where: { email } });
    if (!utilizador) return res.status(404).json({ erro: 'Utilizador não encontrado' });

    const senhaCorreta = await bcrypt.compare(password, utilizador.password);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Password incorreta' });

    const token = jwt.sign(
      { id: utilizador.id, email: utilizador.email, perfil: utilizador.perfil, nome: utilizador.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await registar_log(utilizador.id, 'Iniciou sessão', `Perfil: ${utilizador.perfil}`);
    res.json({ token, utilizador: { id: utilizador.id, nome: utilizador.nome, email: utilizador.email, perfil: utilizador.perfil } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { login };