// ─────────────────────────────────────────────────────────────
//  Controller: conteudoController.js
//
//  Gere os textos editáveis das páginas públicas do site.
//  O admin pode editar títulos e subtítulos do Hero, etc.
//
//  Rotas públicas (sem login):
//    GET /conteudo?pagina=principal  → buscar conteúdo de uma página
//
//  Rotas de admin (com login):
//    GET /conteudo/admin             → listar tudo
//    PUT /conteudo/update/:id        → atualizar uma secção
// ─────────────────────────────────────────────────────────────

const { ConteudoPagina } = require('../models');

// ── Buscar conteúdo de uma página (público) ───────────────────
// Exemplo: GET /conteudo?pagina=principal
// Devolve todas as secções da página pedida.
const conteudo_get_publico = async (req, res) => {
  try {
    const { pagina } = req.query;

    const filtro = pagina ? { pagina } : {};

    const conteudos = await ConteudoPagina.findAll({
      where: filtro,
    });

    // Converter para objeto mais fácil de usar no frontend:
    // { hero: { titulo: '...', subtitulo: '...' }, servicos_header: { ... } }
    const resultado = {};
    conteudos.forEach((c) => {
      resultado[c.seccao] = { titulo: c.titulo, subtitulo: c.subtitulo };
    });

    res.json(resultado);
  } catch (err) {
    console.error('[Conteudo] Erro ao obter:', err.message);
    res.status(500).json({ erro: 'Erro ao obter conteúdo.' });
  }
};

// ── Listar tudo (admin) ───────────────────────────────────────
const conteudo_list = async (req, res) => {
  try {
    const conteudos = await ConteudoPagina.findAll({
      order: [['pagina', 'ASC'], ['seccao', 'ASC']],
    });
    res.json(conteudos);
  } catch (err) {
    console.error('[Conteudo] Erro ao listar:', err.message);
    res.status(500).json({ erro: 'Erro ao listar conteúdo.' });
  }
};

// ── Atualizar uma secção (admin) ──────────────────────────────
// Recebe { titulo, subtitulo } e atualiza o registo.
const conteudo_update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, subtitulo } = req.body;

    const conteudo = await ConteudoPagina.findByPk(id);
    if (!conteudo) {
      return res.status(404).json({ erro: 'Secção não encontrada.' });
    }

    await conteudo.update({ titulo, subtitulo });
    res.json(conteudo);
  } catch (err) {
    console.error('[Conteudo] Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar conteúdo.' });
  }
};

module.exports = {
  conteudo_get_publico,
  conteudo_list,
  conteudo_update,
};
