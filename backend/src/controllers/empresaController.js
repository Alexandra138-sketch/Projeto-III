// ─────────────────────────────────────────────────────────────
//  Controller: empresaController.js
//
//  Trata dos pedidos feitos por utilizadores com perfil 'empresa'.
//  Uma empresa é um cliente que tem uma conta de acesso ao portal.
//  A ligação entre o utilizador e o cliente é feita pelo campo
//  "utilizador_id" na tabela "clientes".
//
//  Funções disponíveis:
//    - empresa_perfil      → GET /empresa/perfil
//    - empresa_incidentes  → GET /empresa/incidentes
//    - empresa_documentos  → GET /empresa/documentos
// ─────────────────────────────────────────────────────────────

const { Cliente, Incidente, Documento, Utilizador } = require('../models');

// ── Função auxiliar ───────────────────────────────────────────
// Encontra o registo de cliente associado ao utilizador autenticado.
// Devolve o cliente ou null se não encontrado.
async function encontrarClienteDaEmpresa(utilizadorId) {
  return await Cliente.findOne({
    where: { utilizador_id: utilizadorId },
  });
}

// ── GET /empresa/perfil ───────────────────────────────────────
// Devolve os dados do cliente (empresa) associado ao utilizador logado.
// Inclui também dados do gestor responsável.
const empresa_perfil = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: { utilizador_id: req.utilizador.id },
      include: [
        {
          // Gestor responsável por esta empresa
          model: Utilizador,
          as: 'gestor',
          attributes: ['id', 'nome', 'email'],
        },
      ],
    });

    if (!cliente) {
      return res.status(404).json({ erro: 'Perfil de empresa não encontrado.' });
    }

    res.json(cliente);
  } catch (err) {
    console.error('[Empresa] Erro ao obter perfil:', err.message);
    res.status(500).json({ erro: 'Erro ao obter dados da empresa.' });
  }
};

// ── GET /empresa/incidentes ───────────────────────────────────
// Devolve apenas os incidentes do cliente associado a este utilizador.
// A empresa não pode ver incidentes de outras empresas.
const empresa_incidentes = async (req, res) => {
  try {
    // Primeiro encontrar qual é o cliente desta empresa
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    // Buscar os incidentes filtrados pelo id do cliente
    const incidentes = await Incidente.findAll({
      where: { cliente_id: cliente.id },
      include: [
        {
          // Quem reportou o incidente
          model: Utilizador,
          as: 'reportador',
          attributes: ['id', 'nome'],
        },
        {
          // Técnico responsável pela resolução
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
    console.error('[Empresa] Erro ao listar incidentes:', err.message);
    res.status(500).json({ erro: 'Erro ao obter incidentes.' });
  }
};

// ── GET /empresa/documentos ───────────────────────────────────
// Devolve apenas os documentos associados ao cliente desta empresa.
const empresa_documentos = async (req, res) => {
  try {
    // Primeiro encontrar qual é o cliente desta empresa
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    // Buscar os documentos filtrados pelo id do cliente
    const documentos = await Documento.findAll({
      where: { cliente_id: cliente.id },
      include: [
        {
          // Quem criou o documento (gestor/admin)
          model: Utilizador,
          as: 'criador',
          attributes: ['id', 'nome'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(documentos);
  } catch (err) {
    console.error('[Empresa] Erro ao listar documentos:', err.message);
    res.status(500).json({ erro: 'Erro ao obter documentos.' });
  }
};

module.exports = {
  empresa_perfil,
  empresa_incidentes,
  empresa_documentos,
};
