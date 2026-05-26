const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Mensagem = require('../models/Mensagem');
const Utilizador = require('../models/Utilizador');

/* ── GET /chat/conversas ── */
/* Devolve a última mensagem de cada conversa (por cliente) */
async function getConversas(req, res) {
  try {
    const [conversas] = await sequelize.query(
      `SELECT DISTINCT ON (m.cliente_id)
         m.id,
         m.conteudo,
         m.cliente_id,
         m.remetente_id,
         m.lida,
         m.criado_em,
         c.nome  AS cliente_nome,
         u.nome  AS remetente_nome,
         (
           SELECT COUNT(*)::int
           FROM mensagens
           WHERE cliente_id = m.cliente_id
             AND lida = false
             AND remetente_id != :userId
         ) AS nao_lidas
       FROM mensagens m
       JOIN clientes     c ON c.id = m.cliente_id
       JOIN utilizadores u ON u.id = m.remetente_id
       ORDER BY m.cliente_id, m.id DESC`,
      { replacements: { userId: req.utilizador.id } }
    );
    res.json(conversas);
  } catch (err) {
    console.error('[Chat] getConversas:', err.message);
    res.status(500).json({ erro: 'Erro ao obter conversas' });
  }
}

/* ── GET /chat/:clienteId ── */
/* Paginação inversa: devolve as últimas 20 mensagens (ou anteriores a `antes`) */
async function getMensagens(req, res) {
  try {
    const clienteId = parseInt(req.params.clienteId, 10);
    const limite    = Math.min(parseInt(req.query.limite, 10) || 20, 50);
    const antes     = req.query.antes ? parseInt(req.query.antes, 10) : null;

    const where = { cliente_id: clienteId };
    if (antes) where.id = { [Op.lt]: antes };

    const mensagens = await Mensagem.findAll({
      where,
      order: [['id', 'DESC']],
      limit: limite,
      include: [{
        model: Utilizador,
        as: 'remetente',
        attributes: ['id', 'nome', 'perfil'],
      }],
    });

    // Marcar como lidas as mensagens do outro
    await Mensagem.update(
      { lida: true },
      {
        where: {
          cliente_id: clienteId,
          remetente_id: { [Op.ne]: req.utilizador.id },
          lida: false,
        },
      }
    );

    res.json(mensagens.reverse());
  } catch (err) {
    console.error('[Chat] getMensagens:', err.message);
    res.status(500).json({ erro: 'Erro ao obter mensagens' });
  }
}

/* ── POST /chat/:clienteId ── */
/* Guarda a mensagem e emite via Socket.IO */
async function enviarMensagem(req, res) {
  try {
    const clienteId = parseInt(req.params.clienteId, 10);
    const { conteudo } = req.body;

    if (!conteudo?.trim()) {
      return res.status(400).json({ erro: 'Conteúdo vazio' });
    }

    const msg = await Mensagem.create({
      conteudo:     conteudo.trim(),
      remetente_id: req.utilizador.id,
      cliente_id:   clienteId,
    });

    const msgCompleta = await Mensagem.findByPk(msg.id, {
      include: [{
        model: Utilizador,
        as: 'remetente',
        attributes: ['id', 'nome', 'perfil'],
      }],
    });

    // Emitir para a sala do cliente
    const io = req.app.get('io');
    if (io) io.to(`chat_${clienteId}`).emit('nova_mensagem', msgCompleta);

    res.status(201).json(msgCompleta);
  } catch (err) {
    console.error('[Chat] enviarMensagem:', err.message);
    res.status(500).json({ erro: 'Erro ao enviar mensagem' });
  }
}

module.exports = { getConversas, getMensagens, enviarMensagem };
