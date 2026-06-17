// ─────────────────────────────────────────────────────────────
//  Rotas: incidenteRoutes.js
//
//  Define os endpoints da API para incidentes de segurança.
//
//  Endpoints disponíveis:
//    GET    /incidentes              → listar incidentes
//    GET    /incidentes?cliente_id=X → filtrar por cliente
//    GET    /incidentes/:id          → ver um incidente
//    POST   /incidentes/create       → registar incidente
//    PUT    /incidentes/update/:id   → atualizar incidente
//    DELETE /incidentes/delete/:id   → eliminar (só admin)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const {
  incidente_list,
  incidente_detail,
  incidente_create,
  incidente_update,
  incidente_delete,
} = require('../controllers/incidenteController');

const { verificarToken, apenasAdmin, adminOuGestor } = require('../middleware/auth');

// Listar e ver incidentes — admin e gestor
router.get('/',    verificarToken, adminOuGestor, incidente_list);
router.get('/:id', verificarToken, adminOuGestor, incidente_detail);

// Criar e editar incidentes — admin e gestor
router.post('/create',        verificarToken, adminOuGestor, incidente_create);
router.put('/update/:id',     verificarToken, adminOuGestor, incidente_update);

// Eliminar incidente — só o admin
router.delete('/delete/:id',  verificarToken, apenasAdmin,   incidente_delete);

module.exports = router;