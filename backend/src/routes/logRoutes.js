const express = require('express');
const router = express.Router();
const { log_list } = require('../controllers/logController');
const { verificarToken, apenasAdmin } = require('../middleware/auth');

router.get('/', verificarToken, apenasAdmin, log_list);

module.exports = router;
