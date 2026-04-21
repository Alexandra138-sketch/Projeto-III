const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', require('./routes/authRoutes'));
app.use('/utilizadores', require('./routes/utilizadorRoutes'));
app.use('/servicos', require('./routes/servicoRoutes'));
app.use('/incidentes', require('./routes/incidenteRoutes'));
app.use('/documentos', require('./routes/documentoRoutes'));
app.use('/clientes', require('./routes/clienteRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});