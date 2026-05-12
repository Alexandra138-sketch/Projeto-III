const express = require('express');
const router = express.Router();
const { utilizador_list, utilizador_detail, utilizador_create, utilizador_update, utilizador_delete } = require('../controllers/utilizadorController');
const { verificarToken, apenasAdmin } = require('../middleware/auth');

router.get('/', verificarToken, apenasAdmin, utilizador_list);
router.get('/:id', verificarToken, utilizador_detail);
router.post('/create', verificarToken, apenasAdmin, utilizador_create);
router.put('/update/:id', verificarToken, apenasAdmin, utilizador_update);
router.delete('/delete/:id', verificarToken, apenasAdmin, utilizador_delete);

module.exports = router;