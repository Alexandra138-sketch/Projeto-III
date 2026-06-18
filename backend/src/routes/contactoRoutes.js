// ─────────────────────────────────────────────────────────────
//  Rotas: contactoRoutes.js
//
//  Rota pública:
//    POST /contactos          → enviar mensagem de contacto
//
//  Rotas admin:
//    GET  /contactos          → listar mensagens recebidas
//    PUT  /contactos/lido/:id → marcar como lida/não lida
//    DELETE /contactos/delete/:id → eliminar mensagem
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const {
  contacto_create,
  contacto_list,
  contacto_marcar_lido,
  contacto_delete,
} = require('../controllers/contactoController');

const { verificarToken, apenasAdmin } = require('../middleware/auth');

// Rota pública — qualquer visitante pode enviar
router.post('/', contacto_create);

// Rotas admin
router.get('/',              verificarToken, apenasAdmin, contacto_list);
router.put('/lido/:id',      verificarToken, apenasAdmin, contacto_marcar_lido);
router.delete('/delete/:id', verificarToken, apenasAdmin, contacto_delete);

module.exports = router;
