const express = require('express');
const router  = express.Router();
const { getConversas, getMensagens, enviarMensagem } = require('../controllers/chatController');
const { verificarToken } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(verificarToken);

router.get('/conversas',    getConversas);
router.get('/:clienteId',   getMensagens);
router.post('/:clienteId',  enviarMensagem);

module.exports = router;
