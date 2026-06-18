// ─────────────────────────────────────────────────────────────
//  Rotas: empresaRoutes.js
//
//  Endpoints exclusivos para utilizadores com perfil 'empresa'.
//  Cada empresa só vê os seus próprios dados (incidentes, documentos).
//
//  Endpoints disponíveis:
//    GET /empresa/perfil      → dados do cliente (empresa)
//    GET /empresa/incidentes  → incidentes do cliente
//    GET /empresa/documentos  → documentos do cliente
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const {
  empresa_perfil,
  empresa_incidentes,
  empresa_documentos,
} = require('../controllers/empresaController');

const { verificarToken, apenasEmpresa } = require('../middleware/auth');

// Todos os endpoints requerem token e perfil 'empresa'
router.get('/perfil',     verificarToken, apenasEmpresa, empresa_perfil);
router.get('/incidentes', verificarToken, apenasEmpresa, empresa_incidentes);
router.get('/documentos', verificarToken, apenasEmpresa, empresa_documentos);

module.exports = router;
