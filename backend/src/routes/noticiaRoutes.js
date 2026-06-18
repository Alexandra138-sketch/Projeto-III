// ─────────────────────────────────────────────────────────────
//  Rotas: noticiaRoutes.js
//
//  Endpoints públicos (sem autenticação):
//    GET /noticias/publico      → listar artigos visíveis
//    GET /noticias/publico/:id  → ver artigo completo
//
//  Endpoints admin (com autenticação):
//    GET    /noticias           → listar todos (incluindo rascunhos)
//    POST   /noticias/create    → criar artigo
//    PUT    /noticias/update/:id → editar artigo
//    DELETE /noticias/delete/:id → eliminar artigo
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const {
  noticia_list_publico,
  noticia_detail_publico,
  noticia_list,
  noticia_create,
  noticia_update,
  noticia_delete,
} = require('../controllers/noticiaController');

const { verificarToken, apenasAdmin } = require('../middleware/auth');

// Rotas públicas — sem verificarToken (qualquer um pode aceder)
router.get('/publico',     noticia_list_publico);
router.get('/publico/:id', noticia_detail_publico);

// Rotas admin — precisam de login e perfil admin
router.get('/',             verificarToken, apenasAdmin, noticia_list);
router.post('/create',      verificarToken, apenasAdmin, noticia_create);
router.put('/update/:id',   verificarToken, apenasAdmin, noticia_update);
router.delete('/delete/:id',verificarToken, apenasAdmin, noticia_delete);

module.exports = router;
