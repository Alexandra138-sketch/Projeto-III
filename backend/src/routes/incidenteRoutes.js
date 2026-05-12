const express = require('express');
const router = express.Router();
const { incidente_list, incidente_detail, incidente_create, incidente_update, incidente_delete } = require('../controllers/incidenteController');
const { verificarToken } = require('../middleware/auth');

router.get('/', verificarToken, incidente_list);
router.get('/:id', verificarToken, incidente_detail);
router.post('/create', verificarToken, incidente_create);
router.put('/update/:id', verificarToken, incidente_update);
router.delete('/delete/:id', verificarToken, incidente_delete);

module.exports = router;