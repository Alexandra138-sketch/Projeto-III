// ─────────────────────────────────────────────────────────────
//  Controller: noticiaController.js
//
//  Gere os artigos de notícias do site.
//
//  Rotas públicas (sem login):
//    GET /noticias/publico      → listar artigos ativos
//    GET /noticias/publico/:id  → ver um artigo
//
//  Rotas de admin (com login):
//    GET    /noticias           → listar todos (incluindo inativos)
//    POST   /noticias/create    → criar artigo
//    PUT    /noticias/update/:id → editar artigo
//    DELETE /noticias/delete/:id → eliminar artigo
// ─────────────────────────────────────────────────────────────

const { Noticia, Utilizador } = require('../models');

// ── Listagem pública (site) ───────────────────────────────────
// Devolve apenas artigos com ativo=true, do mais recente para o mais antigo.
// Não requer autenticação — qualquer visitante pode ver.
const noticia_list_publico = async (req, res) => {
  try {
    const noticias = await Noticia.findAll({
      where: { ativo: true },
      order: [['created_at', 'DESC']],
      // Não devolver o conteúdo completo na listagem (economiza dados)
      attributes: ['id', 'titulo', 'resumo', 'categoria', 'imagem_url', 'tempo_leitura', 'created_at'],
    });
    res.json(noticias);
  } catch (err) {
    console.error('[Noticias] Erro na listagem pública:', err.message);
    res.status(500).json({ erro: 'Erro ao obter notícias.' });
  }
};

// ── Detalhe público (site) ────────────────────────────────────
// Devolve o artigo completo incluindo o conteúdo.
const noticia_detail_publico = async (req, res) => {
  try {
    const noticia = await Noticia.findOne({
      where: { id: req.params.id, ativo: true },
    });

    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    res.json(noticia);
  } catch (err) {
    console.error('[Noticias] Erro no detalhe público:', err.message);
    res.status(500).json({ erro: 'Erro ao obter notícia.' });
  }
};

// ── Listagem admin ────────────────────────────────────────────
// Admin vê todos os artigos, incluindo rascunhos (ativo=false).
const noticia_list = async (req, res) => {
  try {
    const noticias = await Noticia.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Utilizador,
          as: 'autor',
          attributes: ['id', 'nome'],
        },
      ],
    });
    res.json(noticias);
  } catch (err) {
    console.error('[Noticias] Erro na listagem admin:', err.message);
    res.status(500).json({ erro: 'Erro ao obter notícias.' });
  }
};

// ── Criar artigo ──────────────────────────────────────────────
const noticia_create = async (req, res) => {
  try {
    const { titulo, resumo, conteudo, categoria, imagem_url, tempo_leitura, ativo } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: 'O título é obrigatório.' });
    }

    const nova = await Noticia.create({
      titulo,
      resumo,
      conteudo,
      categoria,
      imagem_url,
      tempo_leitura,
      ativo: ativo !== undefined ? ativo : true,
      criado_por: req.utilizador.id, // admin que criou
    });

    res.status(201).json(nova);
  } catch (err) {
    console.error('[Noticias] Erro ao criar:', err.message);
    res.status(500).json({ erro: 'Erro ao criar notícia.' });
  }
};

// ── Atualizar artigo ──────────────────────────────────────────
// Permite editar e publicar/despublicar (mudar ativo).
const noticia_update = async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);
    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    await noticia.update(req.body);
    res.json(noticia);
  } catch (err) {
    console.error('[Noticias] Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar notícia.' });
  }
};

// ── Eliminar artigo ───────────────────────────────────────────
const noticia_delete = async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);
    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada.' });
    }

    await noticia.destroy();
    res.json({ mensagem: 'Notícia eliminada com sucesso.' });
  } catch (err) {
    console.error('[Noticias] Erro ao eliminar:', err.message);
    res.status(500).json({ erro: 'Erro ao eliminar notícia.' });
  }
};

module.exports = {
  noticia_list_publico,
  noticia_detail_publico,
  noticia_list,
  noticia_create,
  noticia_update,
  noticia_delete,
};
