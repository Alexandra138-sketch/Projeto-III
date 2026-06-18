// ─────────────────────────────────────────────────────────────
//  Controller: incidenteController.js
//
//  Trata da lógica relacionada com incidentes de segurança.
//  Um incidente é qualquer ocorrência que compromete (ou pode
//  comprometer) a segurança de um cliente — ex: ataque DDoS,
//  phishing, acesso não autorizado, etc.
//
//  Funções disponíveis:
//    - incidente_list    → GET /incidentes
//    - incidente_detail  → GET /incidentes/:id
//    - incidente_create  → POST /incidentes/create
//    - incidente_update  → PUT /incidentes/update/:id
//    - incidente_delete  → DELETE /incidentes/delete/:id
// ─────────────────────────────────────────────────────────────

const { Op } = require('sequelize');
const { Incidente, Cliente, Utilizador } = require('../models');

// ── Listar incidentes ─────────────────────────────────────────
// Admin e gestor veem os incidentes.
// Gestor vê apenas incidentes dos seus clientes.
// Pode-se filtrar por cliente: GET /incidentes?cliente_id=3
const incidente_list = async (req, res) => {
  try {
    const perfil = req.utilizador.perfil;

    // Construir o filtro dinamicamente
    const filtro = {};

    // Se foi passado ?cliente_id=X no URL, filtrar por esse cliente
    if (req.query.cliente_id) {
      filtro.cliente_id = req.query.cliente_id;
    }

    // Se for gestor, limitar aos clientes que lhe pertencem
    // Para isso, primeiro buscamos os IDs dos seus clientes
    if (perfil === 'gestor') {
      const clientesDoGestor = await Cliente.findAll({
        where: { gestor_id: req.utilizador.id },
        attributes: ['id'], // só precisamos do id
      });

      // Extrair só os IDs numa lista: [1, 2, 5, ...]
      const idsClientes = clientesDoGestor.map((c) => c.id);

      // Op.in é o equivalente SQL de: WHERE cliente_id IN (1, 2, 5)
      filtro.cliente_id = { [Op.in]: idsClientes };
    }

    const incidentes = await Incidente.findAll({
      where: filtro,
      include: [
        {
          // Dados do cliente afetado
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nome'],
        },
        {
          // Quem registou o incidente
          model: Utilizador,
          as: 'reportador',
          attributes: ['id', 'nome'],
        },
        {
          // Gestor/técnico responsável pela resolução
          model: Utilizador,
          as: 'responsavel',
          attributes: ['id', 'nome'],
        },
      ],
      // Ordenar do mais recente para o mais antigo
      order: [['created_at', 'DESC']],
    });

    res.json(incidentes);
  } catch (err) {
    console.error('[Incidentes] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao obter lista de incidentes.' });
  }
};

// ── Ver detalhes de um incidente ─────────────────────────────
// Devolve toda a informação de um incidente específico.
const incidente_detail = async (req, res) => {
  try {
    const { id } = req.params;

    const incidente = await Incidente.findByPk(id, {
      include: [
        { model: Cliente,    as: 'cliente',    attributes: ['id', 'nome', 'email'] },
        { model: Utilizador, as: 'reportador', attributes: ['id', 'nome'] },
        { model: Utilizador, as: 'responsavel', attributes: ['id', 'nome'] },
      ],
    });

    if (!incidente) {
      return res.status(404).json({ erro: 'Incidente não encontrado.' });
    }

    // Se for gestor, verificar se o incidente pertence a um dos seus clientes
    if (req.utilizador.perfil === 'gestor') {
      const clienteDoGestor = await Cliente.findOne({
        where: { id: incidente.cliente_id, gestor_id: req.utilizador.id },
      });

      if (!clienteDoGestor) {
        return res.status(403).json({ erro: 'Não tens permissão para ver este incidente.' });
      }
    }

    res.json(incidente);
  } catch (err) {
    console.error('[Incidentes] Erro ao obter detalhe:', err.message);
    res.status(500).json({ erro: 'Erro ao obter dados do incidente.' });
  }
};

// ── Criar um novo incidente ───────────────────────────────────
// Regista um novo incidente de segurança.
// O campo "reportado_por" é preenchido automaticamente com o utilizador
// que está autenticado (quem fez o pedido).
const incidente_create = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      severidade,
      estado,
      cliente_id,
      responsavel_id,
      nis2_notificado,
    } = req.body;

    // Campos obrigatórios: título e cliente
    if (!titulo || !cliente_id) {
      return res.status(400).json({ erro: 'Título e cliente são obrigatórios.' });
    }

    const novoIncidente = await Incidente.create({
      titulo,
      descricao,
      severidade: severidade || 'Médio',
      estado: estado || 'Aberto',
      cliente_id,
      reportado_por: req.utilizador.id,
      responsavel_id,
      nis2_notificado: nis2_notificado || false,
    });

    res.status(201).json(novoIncidente);
  } catch (err) {
    console.error('[Incidentes] Erro ao criar:', err.message);
    res.status(500).json({ erro: 'Erro ao criar incidente.' });
  }
};

// ── Atualizar um incidente ────────────────────────────────────
// Permite editar qualquer campo, incluindo mudar o estado
// (ex: de 'Aberto' para 'A Investigar') ou marcar como resolvido.
const incidente_update = async (req, res) => {
  try {
    const { id } = req.params;

    const incidente = await Incidente.findByPk(id);
    if (!incidente) {
      return res.status(404).json({ erro: 'Incidente não encontrado.' });
    }

    await incidente.update(req.body);
    res.json(incidente);
  } catch (err) {
    console.error('[Incidentes] Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar incidente.' });
  }
};

// ── Eliminar um incidente ─────────────────────────────────────
// Apaga o incidente da base de dados.
// Nota: em produção real seria preferível "arquivar" em vez de apagar,
// para manter o registo histórico (prova para auditoria NIS2).
const incidente_delete = async (req, res) => {
  try {
    const { id } = req.params;

    const incidente = await Incidente.findByPk(id);
    if (!incidente) {
      return res.status(404).json({ erro: 'Incidente não encontrado.' });
    }

    await incidente.destroy();
    res.json({ mensagem: 'Incidente eliminado com sucesso.' });
  } catch (err) {
    console.error('[Incidentes] Erro ao eliminar:', err.message);
    res.status(500).json({ erro: 'Erro ao eliminar incidente.' });
  }
};

module.exports = {
  incidente_list,
  incidente_detail,
  incidente_create,
  incidente_update,
  incidente_delete,
};