const { Cliente, Utilizador } = require('../models');

const cliente_list = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [
        { model: Utilizador, as: 'gestor', attributes: ['id', 'nome', 'email'] },
      ],
    });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const cliente_detail = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const cliente_create = async (req, res) => {
  try {
    const novo = await Cliente.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const cliente_update = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Não encontrado' });
    await cliente.update(req.body);
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const cliente_delete = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Não encontrado' });
    await cliente.destroy();
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { cliente_list, cliente_detail, cliente_create, cliente_update, cliente_delete };