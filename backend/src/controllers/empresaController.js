// ─────────────────────────────────────────────────────────────
//  Controller: empresaController.js
//
//  Trata dos pedidos feitos por utilizadores com perfil 'empresa'.
//  Uma empresa é um cliente que tem uma conta de acesso ao portal.
//
//  Funções disponíveis:
//    - empresa_perfil              → GET  /empresa/perfil
//    - empresa_incidentes          → GET  /empresa/incidentes
//    - empresa_documentos          → GET  /empresa/documentos
//    - empresa_reportar_incidente  → POST /empresa/incidentes
//    - empresa_upload_documento    → POST /empresa/documentos
// ─────────────────────────────────────────────────────────────

const { Cliente, Incidente, Documento, Utilizador } = require('../models');

// ── Função auxiliar ───────────────────────────────────────────
// Encontra o registo de cliente associado ao utilizador autenticado.
async function encontrarClienteDaEmpresa(utilizadorId) {
  return await Cliente.findOne({
    where: { utilizador_id: utilizadorId },
  });
}

// ── GET /empresa/perfil ───────────────────────────────────────
const empresa_perfil = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: { utilizador_id: req.utilizador.id },
      include: [
        { model: Utilizador, as: 'gestor', attributes: ['id', 'nome', 'email'] },
      ],
    });
    if (!cliente) return res.status(404).json({ erro: 'Perfil de empresa não encontrado.' });
    res.json(cliente);
  } catch (err) {
    console.error('[Empresa] Erro ao obter perfil:', err.message);
    res.status(500).json({ erro: 'Erro ao obter dados da empresa.' });
  }
};

// ── GET /empresa/incidentes ───────────────────────────────────
const empresa_incidentes = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const incidentes = await Incidente.findAll({
      where: { cliente_id: cliente.id },
      include: [
        { model: Utilizador, as: 'reportador',  attributes: ['id', 'nome'] },
        { model: Utilizador, as: 'responsavel', attributes: ['id', 'nome'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(incidentes);
  } catch (err) {
    console.error('[Empresa] Erro ao listar incidentes:', err.message);
    res.status(500).json({ erro: 'Erro ao obter incidentes.' });
  }
};

// ── POST /empresa/incidentes ──────────────────────────────────
// Permite que a empresa reporte um novo incidente de segurança
const empresa_reportar_incidente = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const { titulo, descricao, severidade, tipo_incidente, sistemas_afetados,
            utilizadores_afetados, dados_comprometidos, origem_ataque } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Título e descrição são obrigatórios.' });
    }

    // Criar o incidente associado a este cliente
    // O estado inicial é sempre 'Aberto' — o gestor irá tratar
    const novoIncidente = await Incidente.create({
      titulo,
      descricao,
      severidade:            severidade           || 'Médio',
      estado:                'Aberto',
      tipo_incidente:        tipo_incidente        || null,
      sistemas_afetados:     sistemas_afetados     || null,
      utilizadores_afetados: utilizadores_afetados || null,
      dados_comprometidos:   dados_comprometidos   || false,
      origem_ataque:         origem_ataque         || null,
      cliente_id:            cliente.id,
      reportado_por:         req.utilizador.id,
      nis2_notificado:       false,
    });

    res.status(201).json(novoIncidente);
  } catch (err) {
    console.error('[Empresa] Erro ao reportar incidente:', err.message);
    res.status(500).json({ erro: 'Erro ao reportar incidente.' });
  }
};

// ── GET /empresa/documentos ───────────────────────────────────
const empresa_documentos = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const documentos = await Documento.findAll({
      where: { cliente_id: cliente.id },
      include: [
        { model: Utilizador, as: 'criador', attributes: ['id', 'nome'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(documentos);
  } catch (err) {
    console.error('[Empresa] Erro ao listar documentos:', err.message);
    res.status(500).json({ erro: 'Erro ao obter documentos.' });
  }
};

// ── POST /empresa/documentos ──────────────────────────────────
// Permite que a empresa faça upload de documentação interna / evidências
const empresa_upload_documento = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const { titulo, descricao, tipo, versao } = req.body;
    if (!titulo) return res.status(400).json({ erro: 'Título é obrigatório.' });

    const dados = {
      titulo,
      descricao: descricao || '',
      tipo:      tipo      || 'Outro',
      versao:    versao    || 'v1.0',
      estado:    'Em Revisão', // documentos da empresa ficam em revisão até o gestor validar
      cliente_id: cliente.id,
      criado_por: req.utilizador.id,
    };

    // Se foi enviado um ficheiro, guardar o nome e tamanho
    if (req.file) {
      dados.ficheiro = req.file.filename;
      dados.tamanho  = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
    }

    const novoDocumento = await Documento.create(dados);
    res.status(201).json(novoDocumento);
  } catch (err) {
    console.error('[Empresa] Erro ao fazer upload de documento:', err.message);
    res.status(500).json({ erro: 'Erro ao guardar documento.' });
  }
};


module.exports = {
  empresa_perfil,
  empresa_incidentes,
  empresa_documentos,
  empresa_reportar_incidente,
  empresa_upload_documento,
};
