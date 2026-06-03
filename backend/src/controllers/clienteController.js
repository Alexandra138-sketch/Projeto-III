const { Cliente, Utilizador } = require('../models');
const sequelize = require('../config/database');

const cliente_list = async (req, res) => {
  try {
    /* Se for gestor, mostrar apenas os seus clientes atribuídos */
    const isGestor = req.utilizador?.perfil === 'gestor';
    const whereClause = isGestor
      ? `WHERE c.gestor_id = ${parseInt(req.utilizador.id, 10)}`
      : '';

    const [clientes] = await sequelize.query(`
      SELECT
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.estado,
        c.gestor_id,
        c.utilizador_id,
        c.created_at,
        u.nome  AS gestor_nome,
        u.email AS gestor_email,
        COALESCE(inc.total, 0)::int  AS total_incidentes,
        COALESCE(inc.abertos, 0)::int AS incidentes_abertos,
        COALESCE(doc.total, 0)::int  AS total_documentos,
        COALESCE(msg.total, 0)::int  AS total_mensagens
      FROM clientes c
      LEFT JOIN utilizadores u
        ON u.id = c.gestor_id
      LEFT JOIN (
        SELECT cliente_id,
               COUNT(*)                               AS total,
               COUNT(*) FILTER (WHERE estado IN ('Aberto', 'A Investigar')) AS abertos
        FROM incidentes
        GROUP BY cliente_id
      ) inc ON inc.cliente_id = c.id
      LEFT JOIN (
        SELECT cliente_id, COUNT(*) AS total
        FROM documentos
        GROUP BY cliente_id
      ) doc ON doc.cliente_id = c.id
      LEFT JOIN (
        SELECT cliente_id, COUNT(*) AS total
        FROM mensagens
        GROUP BY cliente_id
      ) msg ON msg.cliente_id = c.id
      ${whereClause}
      ORDER BY c.nome
    `);
    res.json(clientes);
  } catch (err) {
    console.error('[Clientes] lista:', err.message);
    res.status(500).json({ erro: err.message });
  }
};

const cliente_detail = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        { model: Utilizador, as: 'gestor', attributes: ['id', 'nome', 'email'] },
      ],
    });
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