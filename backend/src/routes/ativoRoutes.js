// ─────────────────────────────────────────────────────────────
//  Rotas: ativoRoutes.js
//
//  Endpoints para gestores e admins verem os ativos das empresas.
//
//  Endpoints:
//    GET /ativos?cliente_id=X  → listar ativos de um cliente
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { ativo_list_cliente } = require('../controllers/pedidoController');
const { verificarToken, adminOuGestor } = require('../middleware/auth');

// Gestor/admin vê os ativos de um cliente
router.get('/', verificarToken, adminOuGestor, ativo_list_cliente);

module.exports = router;
