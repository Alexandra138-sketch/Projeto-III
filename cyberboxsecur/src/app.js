const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/auth', require('./routes/authRoutes'));
app.use('/utilizadores', require('./routes/utilizadorRoutes'));
app.use('/servicos', require('./routes/servicoRoutes'));
app.use('/incidentes', require('./routes/incidenteRoutes'));
app.use('/documentos', require('./routes/documentoRoutes'));
app.use('/clientes', require('./routes/clienteRoutes'));

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de dados sincronizada!');
  app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
  });
}).catch(err => console.error('Erro ao conectar à BD:', err));