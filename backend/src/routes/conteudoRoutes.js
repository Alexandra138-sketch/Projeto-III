// ─────────────────────────────────────────────────────────────
//  Rotas: conteudoRoutes.js
//
//  Rota pública:
//    GET /conteudo?pagina=principal → conteúdo de uma página
//
//  Rotas admin:
//    GET /conteudo/admin            → listar tudo
//    PUT /conteudo/update/:id       → atualizar secção
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const {
  conteudo_get_publico,
  conteudo_list,
  conteudo_update,
} = require('../controllers/conteudoController');

const { verificarToken, apenasAdmin } = require('../middleware/auth');

// Rota pública
router.get('/', conteudo_get_publico);

// Rotas admin
router.get('/admin',         verificarToken, apenasAdmin, conteudo_list);
router.put('/update/:id',    verificarToken, apenasAdmin, conteudo_update);

module.exports = router;
