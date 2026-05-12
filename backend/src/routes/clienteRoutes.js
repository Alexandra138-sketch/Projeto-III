const express = require('express');
const router = express.Router();
const { cliente_list, cliente_detail, cliente_create, cliente_update, cliente_delete } = require('../controllers/clienteController');
const { verificarToken } = require('../middleware/auth');

router.get('/', verificarToken, cliente_list);
router.get('/:id', verificarToken, cliente_detail);
router.post('/create', verificarToken, cliente_create);
router.put('/update/:id', verificarToken, cliente_update);
router.delete('/delete/:id', verificarToken, cliente_delete);

module.exports = router;