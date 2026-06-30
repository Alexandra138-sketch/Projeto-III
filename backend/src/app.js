const http    = require('http');
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

/* ── Socket.IO ── */
const io = new Server(server, {
  cors: { origin: '*' },
});

// Disponibiliza `io` nos controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // Entrar numa sala de conversa (por cliente_id)
  socket.on('entrar_chat', (clienteId) => {
    socket.join(`chat_${clienteId}`);
  });

  // Sair da sala
  socket.on('sair_chat', (clienteId) => {
    socket.leave(`chat_${clienteId}`);
  });

  // Indicador "a escrever..."
  socket.on('a_escrever', ({ clienteId, nome }) => {
    socket.to(`chat_${clienteId}`).emit('utilizador_a_escrever', { nome });
  });

  // Parou de escrever
  socket.on('parou_escrever', ({ clienteId }) => {
    socket.to(`chat_${clienteId}`).emit('utilizador_parou_escrever');
  });
});

/* ── Middleware ── */
app.use(cors());
app.use(express.json());
const uploadsDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

/* ── Rotas ── */
app.use('/auth',        require('./routes/authRoutes'));
app.use('/utilizadores',require('./routes/utilizadorRoutes'));
app.use('/servicos',    require('./routes/servicoRoutes'));
app.use('/incidentes',  require('./routes/incidenteRoutes'));
app.use('/documentos',  require('./routes/documentoRoutes'));
app.use('/clientes',    require('./routes/clienteRoutes'));
app.use('/chat',        require('./routes/chatRoutes'));
app.use('/noticias',    require('./routes/noticiaRoutes'));
app.use('/contactos',   require('./routes/contactoRoutes'));
app.use('/conteudo',    require('./routes/conteudoRoutes'));
app.use('/logs',        require('./routes/logRoutes'));
app.use('/empresa',     require('./routes/empresaRoutes'));
app.use('/pedidos',     require('./routes/pedidoRoutes'));
app.use('/ativos',      require('./routes/ativoRoutes'));

/* ── Arranque ── */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
