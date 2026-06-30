// ─────────────────────────────────────────────────────────────
//  Controller: empresaController.js
//
//  Trata dos pedidos feitos por utilizadores com perfil 'empresa'.
//  Uma empresa é um cliente que tem uma conta de acesso ao portal.
//
//  Funções disponíveis:
//    - empresa_perfil           → GET  /empresa/perfil
//    - empresa_incidentes       → GET  /empresa/incidentes
//    - empresa_documentos       → GET  /empresa/documentos
//    - empresa_reportar_incidente → POST /empresa/incidentes
//    - empresa_upload_documento → POST /empresa/documentos
//    - empresa_list_ativos      → GET  /empresa/ativos
//    - empresa_create_ativo     → POST /empresa/ativos
//    - empresa_update_ativo     → PUT  /empresa/ativos/:id
//    - empresa_delete_ativo     → DELETE /empresa/ativos/:id
//    - empresa_list_pedidos     → GET  /empresa/pedidos
//    - empresa_create_pedido    → POST /empresa/pedidos
// ─────────────────────────────────────────────────────────────

const { Cliente, Incidente, Documento, Utilizador, Ativo, Pedido } = require('../models');

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

// ── GET /empresa/ativos ───────────────────────────────────────
const empresa_list_ativos = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const ativos = await Ativo.findAll({
      where: { cliente_id: cliente.id },
      order: [['created_at', 'DESC']],
    });
    res.json(ativos);
  } catch (err) {
    console.error('[Empresa] Erro ao listar ativos:', err.message);
    res.status(500).json({ erro: 'Erro ao obter ativos tecnológicos.' });
  }
};

// ── POST /empresa/ativos ──────────────────────────────────────
const empresa_create_ativo = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    if (!req.body.nome) return res.status(400).json({ erro: 'O nome do ativo é obrigatório.' });

    const novoAtivo = await Ativo.create({
      ...req.body,
      cliente_id: cliente.id,
    });
    res.status(201).json(novoAtivo);
  } catch (err) {
    console.error('[Empresa] Erro ao criar ativo:', err.message);
    res.status(500).json({ erro: 'Erro ao criar ativo tecnológico.' });
  }
};

// ── PUT /empresa/ativos/:id ───────────────────────────────────
const empresa_update_ativo = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    // Verificar se o ativo pertence a este cliente (segurança)
    const ativo = await Ativo.findOne({
      where: { id: req.params.id, cliente_id: cliente.id },
    });
    if (!ativo) return res.status(404).json({ erro: 'Ativo não encontrado.' });

    await ativo.update(req.body);
    res.json(ativo);
  } catch (err) {
    console.error('[Empresa] Erro ao atualizar ativo:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar ativo tecnológico.' });
  }
};

// ── DELETE /empresa/ativos/:id ────────────────────────────────
const empresa_delete_ativo = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const ativo = await Ativo.findOne({
      where: { id: req.params.id, cliente_id: cliente.id },
    });
    if (!ativo) return res.status(404).json({ erro: 'Ativo não encontrado.' });

    await ativo.destroy();
    res.json({ mensagem: 'Ativo eliminado com sucesso.' });
  } catch (err) {
    console.error('[Empresa] Erro ao eliminar ativo:', err.message);
    res.status(500).json({ erro: 'Erro ao eliminar ativo tecnológico.' });
  }
};

// ── GET /empresa/pedidos ──────────────────────────────────────
const empresa_list_pedidos = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const pedidos = await Pedido.findAll({
      where: { cliente_id: cliente.id },
      include: [
        { model: require('../models').Utilizador, as: 'respondedor', attributes: ['id', 'nome'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(pedidos);
  } catch (err) {
    console.error('[Empresa] Erro ao listar pedidos:', err.message);
    res.status(500).json({ erro: 'Erro ao obter pedidos.' });
  }
};

// ── POST /empresa/pedidos ─────────────────────────────────────
const empresa_create_pedido = async (req, res) => {
  try {
    const cliente = await encontrarClienteDaEmpresa(req.utilizador.id);
    if (!cliente) return res.status(404).json({ erro: 'Empresa não encontrada.' });

    const { tipo, assunto, descricao } = req.body;
    if (!assunto || !descricao) {
      return res.status(400).json({ erro: 'Assunto e descrição são obrigatórios.' });
    }

    const novoPedido = await Pedido.create({
      cliente_id: cliente.id,
      tipo:       tipo    || 'Questão',
      assunto,
      descricao,
      estado:     'Pendente',
    });
    res.status(201).json(novoPedido);
  } catch (err) {
    console.error('[Empresa] Erro ao criar pedido:', err.message);
    res.status(500).json({ erro: 'Erro ao submeter pedido.' });
  }
};

module.exports = {
  empresa_perfil,
  empresa_incidentes,
  empresa_documentos,
  empresa_reportar_incidente,
  empresa_upload_documento,
  empresa_list_ativos,
  empresa_create_ativo,
  empresa_update_ativo,
  empresa_delete_ativo,
  empresa_list_pedidos,
  empresa_create_pedido,
};
