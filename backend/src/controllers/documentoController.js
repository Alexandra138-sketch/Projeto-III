const { Documento, Cliente, Utilizador } = require('../models');

const documento_list = async (req, res) => {
  try {
    const documentos = await Documento.findAll({
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
        { model: Utilizador, as: 'criador', attributes: ['id', 'nome'] },
      ],
    });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const documento_detail = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(documento);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const documento_create = async (req, res) => {
  try {
    const dados = { ...req.body };
    if (req.file) {
      dados.ficheiro = req.file.filename;
      dados.tamanho = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
    }
    const novo = await Documento.create(dados);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const documento_update = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Não encontrado' });
    await documento.update(req.body);
    res.json(documento);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const documento_delete = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Não encontrado' });
    await documento.destroy();
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { documento_list, documento_detail, documento_create, documento_update, documento_delete };