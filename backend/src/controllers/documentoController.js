const { Documento, Cliente, Utilizador } = require('../models');
const { registar_log } = require('./logController');

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
    await registar_log(req.utilizador?.id, 'Criou documento', `Documento "${novo.titulo}"`);
    res.status(201).json(novo);
  } catch (err) {
    console.error('[documento_create]', err);
    res.status(500).json({ erro: err.message });
  }
};

const documento_update = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Não encontrado' });
    await documento.update(req.body);
    await registar_log(req.utilizador?.id, 'Editou documento', `Documento "${documento.titulo}"`);
    res.json(documento);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const documento_delete = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Não encontrado' });
    const titulo = documento.titulo;
    await documento.destroy();
    await registar_log(req.utilizador?.id, 'Eliminou documento', `Documento "${titulo}"`);
    res.json({ mensagem: 'Eliminado com sucesso' });
  } catch (err) {
    console.error('[documento_delete]', err);
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { documento_list, documento_detail, documento_create, documento_update, documento_delete };
