// ─────────────────────────────────────────────────────────────
//  Rotas: empresaRoutes.js
//
//  Endpoints exclusivos para utilizadores com perfil 'empresa'.
//  Cada empresa só vê e gere os seus próprios dados.
//
//  Endpoints:
//    GET  /empresa/perfil              → dados do cliente
//    GET  /empresa/incidentes          → ver incidentes
//    POST /empresa/incidentes          → reportar novo incidente
//    GET  /empresa/documentos          → ver documentos
//    POST /empresa/documentos          → fazer upload de documentos
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const {
  empresa_perfil,
  empresa_incidentes,
  empresa_documentos,
  empresa_reportar_incidente,
  empresa_upload_documento,
} = require('../controllers/empresaController');

const { verificarToken, apenasEmpresa } = require('../middleware/auth');

// Configurar o multer para uploads de ficheiros
const uploadsDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Todos os endpoints requerem token e perfil 'empresa'
router.get('/perfil',        verificarToken, apenasEmpresa, empresa_perfil);

// Incidentes
router.get('/incidentes',    verificarToken, apenasEmpresa, empresa_incidentes);
router.post('/incidentes',   verificarToken, apenasEmpresa, empresa_reportar_incidente);

// Documentos
router.get('/documentos',    verificarToken, apenasEmpresa, empresa_documentos);
router.post('/documentos',   verificarToken, apenasEmpresa, upload.single('ficheiro'), empresa_upload_documento);

module.exports = router;
