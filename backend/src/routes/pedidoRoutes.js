// ─────────────────────────────────────────────────────────────
//  Rotas: pedidoRoutes.js
//
//  Endpoints para gestores e admins gerirem os pedidos das empresas.
//
//  Endpoints:
//    GET /pedidos?cliente_id=X  → listar pedidos de um cliente
//    PUT /pedidos/:id           → atualizar estado e responder
//    GET /ativos?cliente_id=X   → listar ativos de um cliente
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const {
  pedido_list_cliente,
  pedido_update_estado,
  ativo_list_cliente,
} = require('../controllers/pedidoController');

const { verificarToken, adminOuGestor } = require('../middleware/auth');

// Gestor/admin vê os pedidos de um cliente (passado como query param)
router.get('/',    verificarToken, adminOuGestor, pedido_list_cliente);

// Gestor/admin responde ou atualiza o estado de um pedido
router.put('/:id', verificarToken, adminOuGestor, pedido_update_estado);

module.exports = router;
