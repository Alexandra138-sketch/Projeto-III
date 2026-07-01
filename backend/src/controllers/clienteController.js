// ─────────────────────────────────────────────────────────────
//  Controller: clienteController.js
//
//  Este ficheiro trata de toda a lógica relacionada com clientes.
//  Cada função corresponde a uma ação (listar, ver, criar, etc.)
//  e é chamada quando o utilizador faz um pedido à API.
//
//  Funções disponíveis:
//    - cliente_list    → GET /clientes
//    - cliente_detail  → GET /clientes/:id
//    - cliente_create  → POST /clientes/create
//    - cliente_update  → PUT /clientes/update/:id
//    - cliente_delete  → DELETE /clientes/delete/:id
// ─────────────────────────────────────────────────────────────

const { QueryTypes } = require('sequelize');
const { Cliente, Utilizador, Incidente, Documento } = require('../models');
const sequelize = require('../config/database');

// ── Listar todos os clientes ──────────────────────────────────
// Admin vê todos os clientes.
// Gestor vê apenas os clientes que lhe estão atribuídos.
//
// Esta função usa SQL direto (não Sequelize ORM) porque precisamos
// de contar incidentes, documentos e mensagens numa só query eficiente.
// A grande diferença para a versão antiga é que usamos ":gestorId"
// em vez de meter o id diretamente na string — isso evita SQL Injection.
const cliente_list = async (req, res) => {
  try {
    const isGestor = req.utilizador?.perfil === 'gestor';

    // ── Construir filtro de forma segura ──
    // Em vez de escrever WHERE gestor_id = 5 diretamente na string
    // (que é um risco de segurança), usamos um "placeholder" :gestorId
    // e passamos o valor em "replacements" — o Sequelize trata de o escapar.
    const whereClause = isGestor ? 'WHERE c.gestor_id = :gestorId' : '';
    const replacements = isGestor ? { gestorId: req.utilizador.id } : {};

    const clientes = await sequelize.query(
      `SELECT
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.estado,
        c.gestor_id,
        c.utilizador_id,
        c.created_at,
        -- Campos do responsável de segurança
        c.resp_seguranca_nome,
        c.resp_seguranca_email,
        -- Dados do gestor (via JOIN à tabela utilizadores)
        u.nome  AS gestor_nome,
        u.email AS gestor_email,
        -- Contagens de registos associados
        COALESCE(inc.total, 0)::int   AS total_incidentes,
        COALESCE(inc.abertos, 0)::int AS incidentes_abertos,
        COALESCE(doc.total, 0)::int   AS total_documentos,
        COALESCE(msg.total, 0)::int   AS total_mensagens
      FROM clientes c
      -- LEFT JOIN significa: trazer o gestor SE existir, senão ficar nulo
      LEFT JOIN utilizadores u ON u.id = c.gestor_id
      -- Subquery: contar incidentes por cliente
      LEFT JOIN (
        SELECT cliente_id,
               COUNT(*) AS total,
               COUNT(*) FILTER (WHERE estado IN ('Aberto', 'A Investigar')) AS abertos
        FROM incidentes
        GROUP BY cliente_id
      ) inc ON inc.cliente_id = c.id
      -- Subquery: contar documentos por cliente
      LEFT JOIN (
        SELECT cliente_id, COUNT(*) AS total
        FROM documentos
        GROUP BY cliente_id
      ) doc ON doc.cliente_id = c.id
      -- Subquery: contar mensagens por cliente
      LEFT JOIN (
        SELECT cliente_id, COUNT(*) AS total
        FROM mensagens
        GROUP BY cliente_id
      ) msg ON msg.cliente_id = c.id
      ${whereClause}
      ORDER BY c.nome`,
      {
        replacements,           // valores seguros para os placeholders
        type: QueryTypes.SELECT // diz ao Sequelize que é um SELECT
      }
    );

    res.json(clientes);
  } catch (err) {
    console.error('[Clientes] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao obter lista de clientes.' });
  }
};

// ── Ver detalhes de um cliente específico ─────────────────────
// Devolve toda a informação de um cliente, incluindo o gestor.
const cliente_detail = async (req, res) => {
  try {
    const { id } = req.params; // id vem do URL: /clientes/5

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          // Trazer dados do gestor responsável
          model: Utilizador,
          as: 'gestor',
          attributes: ['id', 'nome', 'email', 'telefone'],
        },
        {
          // Trazer dados do utilizador/empresa (conta de login)
          model: Utilizador,
          as: 'utilizador',
          attributes: ['id', 'nome', 'email'],
        },
      ],
    });

    // Se o cliente não existir, devolver erro 404
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    // Garantir que um gestor só vê os seus próprios clientes
    if (req.utilizador.perfil === 'gestor' && cliente.gestor_id !== req.utilizador.id) {
      return res.status(403).json({ erro: 'Não tens permissão para ver este cliente.' });
    }

    // Serializar e garantir que created_at está sempre presente
    const dados = cliente.toJSON();
    dados.created_at = dados.created_at || dados.createdAt || null;
    res.json(dados);
  } catch (err) {
    console.error('[Clientes] Erro ao obter detalhe:', err.message);
    res.status(500).json({ erro: 'Erro ao obter dados do cliente.' });
  }
};

// ── Criar um novo cliente ─────────────────────────────────────
// Cria o registo do cliente na tabela "clientes".
const cliente_create = async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      estado,
      gestor_id,
      utilizador_id,
      resp_seguranca_nome,
      resp_seguranca_email,
      resp_seguranca_telefone,
      contacto_perm_nome,
      contacto_perm_email,
      contacto_perm_telefone,
    } = req.body;

    // Validar campos obrigatórios antes de tentar criar
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }

    const novoCliente = await Cliente.create({
      nome,
      email,
      telefone,
      estado: estado || 'Ativo',
      gestor_id,
      utilizador_id,
      resp_seguranca_nome,
      resp_seguranca_email,
      resp_seguranca_telefone,
      contacto_perm_nome,
      contacto_perm_email,
      contacto_perm_telefone,
    });

    // 201 = Created (recurso criado com sucesso)
    res.status(201).json(novoCliente);
  } catch (err) {
    console.error('[Clientes] Erro ao criar:', err.message);
    res.status(500).json({ erro: 'Erro ao criar cliente.' });
  }
};

// ── Atualizar dados de um cliente ─────────────────────────────
// Permite editar qualquer campo do cliente.
// Também usado para ativar/desativar (mudar o campo "estado").
const cliente_update = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    // Gestor só pode editar os seus próprios clientes
    if (req.utilizador.perfil === 'gestor' && cliente.gestor_id !== req.utilizador.id) {
      return res.status(403).json({ erro: 'Não tens permissão para editar este cliente.' });
    }

    // O Sequelize só atualiza os campos que forem enviados no body
    await cliente.update(req.body);
    res.json(cliente);
  } catch (err) {
    console.error('[Clientes] Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
  }
};

// ── Eliminar um cliente ───────────────────────────────────────
// Apaga o cliente da base de dados. Só o admin pode fazer isto.
const cliente_delete = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    await cliente.destroy();
    res.json({ mensagem: 'Cliente eliminado com sucesso.' });
  } catch (err) {
    console.error('[Clientes] Erro ao eliminar:', err.message);
    res.status(500).json({ erro: 'Erro ao eliminar cliente.' });
  }
};

module.exports = {
  cliente_list,
  cliente_detail,
  cliente_create,
  cliente_update,
  cliente_delete,
};
