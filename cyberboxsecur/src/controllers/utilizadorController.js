const bcrypt = require('bcryptjs');
const { Utilizador } = require('../models');

const utilizador_list = async (req, res) => {
  try {
    const utilizadores = await Utilizador.findAll({ attributes: { exclude: ['password'] } });
    res.json(utilizadores);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_detail = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!utilizador) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(utilizador);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_create = async (req, res) => {
  try {
    const { nome, email, password, telefone, perfil } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const novo = await Utilizador.create({ nome, email, password: hash, telefone, perfil });
    res.status(201).json({ id: novo.id, nome: novo.nome, email: novo.email, perfil: novo.perfil });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_update = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ erro: 'Não encontrado' });
    const { nome, email, telefone, perfil, estado } = req.body;
    await utilizador.update({ nome, email, telefone, perfil, estado });
    res.json(utilizador);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_delete = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ erro: 'Não encontrado' });
    await utilizador.destroy();
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { utilizador_list, utilizador_detail, utilizador_create, utilizador_update, utilizador_delete };