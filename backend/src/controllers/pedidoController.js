// ─────────────────────────────────────────────────────────────
//  Controller: pedidoController.js
//
//  Funções para o gestor/admin gerir os pedidos das empresas.
//  O gestor pode ver os pedidos dos seus clientes e responder.
//
//  Funções disponíveis:
//    - pedido_list_cliente  → GET  /pedidos?cliente_id=X (gestor/admin)
//    - pedido_update_estado → PUT  /pedidos/:id         (gestor/admin)
// ─────────────────────────────────────────────────────────────

const { Pedido, Cliente, Utilizador } = require('../models');

// ── GET /pedidos?cliente_id=X ─────────────────────────────────
// Devolve os pedidos de um cliente específico (para o gestor ver)
const pedido_list_cliente = async (req, res) => {
  try {
    const { cliente_id } = req.query;

    // cliente_id é obrigatório para esta rota
    if (!cliente_id) {
      return res.status(400).json({ erro: 'Parâmetro cliente_id é obrigatório.' });
    }

    const pedidos = await Pedido.findAll({
      where: { cliente_id },
      include: [
        { model: Utilizador, as: 'respondedor', attributes: ['id', 'nome'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(pedidos);
  } catch (err) {
    console.error('[Pedido] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao obter pedidos.' });
  }
};

// ── PUT /pedidos/:id ──────────────────────────────────────────
// O gestor atualiza o estado e/ou responde ao pedido da empresa
const pedido_update_estado = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

    const { estado, resposta } = req.body;

    // Atualizar apenas os campos enviados
    const dadosAtualizar = {};
    if (estado)   dadosAtualizar.estado   = estado;
    if (resposta) {
      dadosAtualizar.resposta       = resposta;
      dadosAtualizar.respondido_por = req.utilizador.id;
    }

    await pedido.update(dadosAtualizar);

    // Devolver o pedido atualizado com o nome do respondedor
    const pedidoAtualizado = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Utilizador, as: 'respondedor', attributes: ['id', 'nome'] },
      ],
    });

    res.json(pedidoAtualizado);
  } catch (err) {
    console.error('[Pedido] Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar pedido.' });
  }
};

// ── GET /ativos?cliente_id=X ──────────────────────────────────
// Devolve os ativos tecnológicos de um cliente (para o gestor ver)
const ativo_list_cliente = async (req, res) => {
  try {
    const { Ativo } = require('../models');
    const { cliente_id } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ erro: 'Parâmetro cliente_id é obrigatório.' });
    }

    const ativos = await Ativo.findAll({
      where: { cliente_id },
      order: [['created_at', 'DESC']],
    });

    res.json(ativos);
  } catch (err) {
    console.error('[Ativo] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao obter ativos.' });
  }
};

module.exports = { pedido_list_cliente, pedido_update_estado, ativo_list_cliente };
