const express = require('express');
const router = express.Router();
const {
  utilizador_list,
  utilizador_detail,
  utilizador_create,
  utilizador_update,
  utilizador_delete,
  meu_perfil_get,
  meu_perfil_update,
} = require('../controllers/utilizadorController');
const { verificarToken, apenasAdmin } = require('../middleware/auth');

// Rotas de auto-gestão do próprio perfil — têm de vir ANTES de '/:id',
// senão o Express interpreta 'me' como valor de :id.
router.get('/me', verificarToken, meu_perfil_get);
router.put('/me', verificarToken, meu_perfil_update);

router.get('/',       verificarToken, apenasAdmin, utilizador_list);
router.get('/:id',    verificarToken, apenasAdmin, utilizador_detail);
router.post('/',      verificarToken, apenasAdmin, utilizador_create);
router.put('/:id',    verificarToken, apenasAdmin, utilizador_update);
router.delete('/:id', verificarToken, apenasAdmin, utilizador_delete);

module.exports = router;
