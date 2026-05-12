const { Incidente, Cliente, Utilizador } = require('../models');

const incidente_list = async (req, res) => {
  try {
    const incidentes = await Incidente.findAll({
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
        { model: Utilizador, as: 'reportador', attributes: ['id', 'nome'] },
      ],
    });
    res.json(incidentes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const incidente_detail = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
      ],
    });
    if (!incidente) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(incidente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const incidente_create = async (req, res) => {
  try {
    const novo = await Incidente.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const incidente_update = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id);
    if (!incidente) return res.status(404).json({ erro: 'Não encontrado' });
    await incidente.update(req.body);
    res.json(incidente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const incidente_delete = async (req, res) => {
  try {
    const incidente = await Incidente.findByPk(req.params.id);
    if (!incidente) return res.status(404).json({ erro: 'Não encontrado' });
    await incidente.destroy();
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { incidente_list, incidente_detail, incidente_create, incidente_update, incidente_delete };