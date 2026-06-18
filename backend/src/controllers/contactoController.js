// ─────────────────────────────────────────────────────────────
//  Controller: contactoController.js
//
//  Gere as mensagens enviadas pelo formulário de contacto.
//
//  Rota pública (sem login):
//    POST /contactos          → enviar mensagem de contacto
//
//  Rotas de admin (com login):
//    GET /contactos           → listar todas as mensagens
//    PUT /contactos/lido/:id  → marcar como lida
//    DELETE /contactos/delete/:id → eliminar mensagem
// ─────────────────────────────────────────────────────────────

const { Contacto } = require('../models');

// ── Enviar mensagem (formulário público) ──────────────────────
// Qualquer visitante pode enviar — não requer autenticação.
const contacto_create = async (req, res) => {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ erro: 'Nome, email e mensagem são obrigatórios.' });
    }

    const novo = await Contacto.create({
      nome,
      email,
      telefone,
      assunto,
      mensagem,
      lido: false, // começa como não lido
    });

    res.status(201).json({ mensagem: 'Mensagem enviada com sucesso. Entraremos em contacto brevemente.' });
  } catch (err) {
    console.error('[Contactos] Erro ao criar:', err.message);
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
};

// ── Listar todas as mensagens (admin) ─────────────────────────
// Mostra primeiro as não lidas, depois as mais recentes.
const contacto_list = async (req, res) => {
  try {
    const contactos = await Contacto.findAll({
      order: [
        ['lido', 'ASC'],       // não lidos primeiro
        ['created_at', 'DESC'], // mais recentes primeiro
      ],
    });
    res.json(contactos);
  } catch (err) {
    console.error('[Contactos] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao obter mensagens.' });
  }
};

// ── Marcar como lida ──────────────────────────────────────────
const contacto_marcar_lido = async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id);
    if (!contacto) {
      return res.status(404).json({ erro: 'Mensagem não encontrada.' });
    }

    // Alterna entre lido e não lido
    await contacto.update({ lido: !contacto.lido });
    res.json(contacto);
  } catch (err) {
    console.error('[Contactos] Erro ao marcar lido:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar mensagem.' });
  }
};

// ── Eliminar mensagem ─────────────────────────────────────────
const contacto_delete = async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id);
    if (!contacto) {
      return res.status(404).json({ erro: 'Mensagem não encontrada.' });
    }

    await contacto.destroy();
    res.json({ mensagem: 'Mensagem eliminada com sucesso.' });
  } catch (err) {
    console.error('[Contactos] Erro ao eliminar:', err.message);
    res.status(500).json({ erro: 'Erro ao eliminar mensagem.' });
  }
};

module.exports = {
  contacto_create,
  contacto_list,
  contacto_marcar_lido,
  contacto_delete,
};
