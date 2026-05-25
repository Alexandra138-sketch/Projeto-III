const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilizador = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

const apenasAdmin = (req, res, next) => {
  if (req.utilizador.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
};

module.exports = { verificarToken, apenasAdmin };