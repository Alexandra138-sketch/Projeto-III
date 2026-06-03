const bcrypt = require('bcryptjs');
const { Utilizador, Cliente } = require('../models');

const utilizador_list = async (req, res) => {
  try {
    const utilizadores = await Utilizador.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });
    res.json(utilizadores);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_detail = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!utilizador) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(utilizador);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_create = async (req, res) => {
  try {
    const { nome, email, password, telefone, perfil } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({ erro: 'Nome, email e password são obrigatórios.' });
    }

    const existe = await Utilizador.findOne({ where: { email } });
    if (existe) return res.status(400).json({ erro: 'Já existe um utilizador com este e-mail.' });

    const hash = await bcrypt.hash(password, 10);
    const perfilFinal = perfil || 'empresa';
    const novo = await Utilizador.create({ nome, email, password: hash, telefone, perfil: perfilFinal });

    /* Se for empresa, criar também o registo de cliente e ligar os dois */
    if (perfilFinal === 'empresa') {
      const cliente = await Cliente.create({
        nome,
        email,
        telefone: telefone || null,
        estado: 'Ativo',
        utilizador_id: novo.id,
      });
      /* Guardar o id do cliente no utilizador (se a coluna existir) — ignorar erro caso não exista */
      try { await novo.update({ cliente_id: cliente.id }); } catch (_) {}
    }

    res.status(201).json({
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      telefone: novo.telefone,
      perfil: novo.perfil,
      estado: novo.estado,
      created_at: novo.created_at,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const utilizador_update = async (req, res) => {
  try {
    const utilizador = await Utilizador.findByPk(req.params.id);
    if (!utilizador) return res.status(404).json({ erro: 'Não encontrado' });

    const { nome, email, telefone, perfil, estado, password } = req.body;

    const campos = {};
    if (nome     !== undefined) campos.nome     = nome;
    if (email    !== undefined) campos.email    = email;
    if (telefone !== undefined) campos.telefone = telefone;
    if (perfil   !== undefined) campos.perfil   = perfil;
    if (estado   !== undefined) campos.estado   = estado;
    if (password)               campos.password = await bcrypt.hash(password, 10);

    await utilizador.update(campos);

    const atualizado = await Utilizador.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    res.json(atualizado);
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

module.exports = {
  utilizador_list,
  utilizador_detail,
  utilizador_create,
  utilizador_update,
  utilizador_delete,
};
