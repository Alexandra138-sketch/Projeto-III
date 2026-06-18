// ─────────────────────────────────────────────────────────────
//  Middleware de Autenticação e Autorização
//
//  Middleware é código que corre ENTRE a chegada do pedido
//  e o controller que vai tratar esse pedido.
//
//  Neste ficheiro temos quatro verificações:
//    1. verificarToken  — o utilizador está autenticado?
//    2. apenasAdmin     — só o admin pode aceder
//    3. adminOuGestor   — admin e gestor podem aceder
//    4. apenasEmpresa   — só contas de empresa podem aceder
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── 1. Verificar Token JWT ────────────────────────────────────
// Este middleware verifica se o utilizador enviou um token válido
// no cabeçalho da requisição (Authorization: Bearer <token>)
const verificarToken = (req, res, next) => {
  // Extrair o token do cabeçalho "Authorization"
  // O formato esperado é: "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
  const token = req.headers['authorization']?.split(' ')[1];

  // Se não houver token, recusar o acesso
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido. Faz login primeiro.' });
  }

  try {
    // Verificar se o token é válido e não expirou
    // jwt.verify lança um erro se o token for inválido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar os dados do utilizador no objeto req
    // para os controllers conseguirem aceder (ex: req.utilizador.id)
    req.utilizador = decoded;

    // Passar para o próximo middleware ou controller
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Faz login novamente.' });
  }
};

// ── 2. Apenas Admin ───────────────────────────────────────────
// Só permite o acesso se o utilizador tiver perfil 'admin'
// Deve ser usado DEPOIS de verificarToken nas rotas
const apenasAdmin = (req, res, next) => {
  if (req.utilizador.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// ── 3. Admin ou Gestor ────────────────────────────────────────
// Permite acesso a admins e gestores, mas não a empresas (clientes)
// Usado nas rotas que gerem informação dos clientes
const adminOuGestor = (req, res, next) => {
  const perfisPermitidos = ['admin', 'gestor'];

  if (!perfisPermitidos.includes(req.utilizador.perfil)) {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores e gestores.' });
  }
  next();
};

// ── 4. Apenas Empresa ─────────────────────────────────────────
// Só permite acesso a utilizadores com perfil 'empresa'
// Usado nas rotas exclusivas para clientes (portal de empresa)
const apenasEmpresa = (req, res, next) => {
  if (req.utilizador.perfil !== 'empresa') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas contas de empresa.' });
  }
  next();
};

module.exports = { verificarToken, apenasAdmin, adminOuGestor, apenasEmpresa };
