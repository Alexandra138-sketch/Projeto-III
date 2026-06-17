// ─────────────────────────────────────────────────────────────
//  Rotas: clienteRoutes.js
//
//  Define os endpoints da API para clientes.
//  Cada rota passa por dois middlewares antes de chegar ao controller:
//    1. verificarToken   → confirma que o utilizador está autenticado
//    2. adminOuGestor    → confirma que tem o perfil correto
//
//  Endpoints disponíveis:
//    GET    /clientes          → listar clientes
//    GET    /clientes/:id      → ver um cliente
//    POST   /clientes/create   → criar cliente (só admin)
//    PUT    /clientes/update/:id → editar cliente
//    DELETE /clientes/delete/:id → eliminar cliente (só admin)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const {
  cliente_list,
  cliente_detail,
  cliente_create,
  cliente_update,
  cliente_delete,
} = require('../controllers/clienteController');

const { verificarToken, apenasAdmin, adminOuGestor } = require('../middleware/auth');

// Listar e ver clientes — admin e gestor podem aceder
router.get('/',    verificarToken, adminOuGestor, cliente_list);
router.get('/:id', verificarToken, adminOuGestor, cliente_detail);

// Criar cliente — só o admin pode criar novos clientes
router.post('/create', verificarToken, apenasAdmin, cliente_create);

// Editar cliente — admin e gestor podem editar
// (o controller verifica se o gestor edita só os seus)
router.put('/update/:id', verificarToken, adminOuGestor, cliente_update);

// Eliminar cliente — só o admin pode apagar
router.delete('/delete/:id', verificarToken, apenasAdmin, cliente_delete);

module.exports = router;