const express = require('express');
const router = express.Router();
const { servico_list, servico_detail, servico_create, servico_update, servico_delete } = require('../controllers/servicoController');
const { verificarToken, apenasAdmin } = require('../middleware/auth');

router.get('/', servico_list);
router.get('/:id', servico_detail);
router.post('/create', verificarToken, apenasAdmin, servico_create);
router.put('/update/:id', verificarToken, apenasAdmin, servico_update);
router.delete('/delete/:id', verificarToken, apenasAdmin, servico_delete);

module.exports = router;