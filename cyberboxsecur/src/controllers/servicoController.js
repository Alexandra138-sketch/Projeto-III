const { Servico } = require('../models');

const servico_list = async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const servico_detail = async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(servico);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const servico_create = async (req, res) => {
  try {
    const novo = await Servico.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const servico_update = async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ erro: 'Não encontrado' });
    await servico.update(req.body);
    res.json(servico);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const servico_delete = async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ erro: 'Não encontrado' });
    await servico.destroy();
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { servico_list, servico_detail, servico_create, servico_update, servico_delete };