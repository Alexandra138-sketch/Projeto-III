const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { documento_list, documento_detail, documento_create, documento_update, documento_delete } = require('../controllers/documentoController');
const { verificarToken } = require('../middleware/auth');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/', verificarToken, documento_list);
router.get('/:id', verificarToken, documento_detail);
router.post('/create', verificarToken, upload.single('ficheiro'), documento_create);
router.put('/update/:id', verificarToken, documento_update);
router.delete('/delete/:id', verificarToken, documento_delete);

module.exports = router;