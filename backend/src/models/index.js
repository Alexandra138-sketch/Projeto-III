const Utilizador     = require('./Utilizador');
const Cliente        = require('./Cliente');
const Incidente      = require('./Incidente');
const Documento      = require('./Documento');
const Servico        = require('./Servico');
const Mensagem       = require('./Mensagem');
const Noticia        = require('./Noticia');
const Contacto       = require('./Contacto');
const ConteudoPagina = require('./ConteudoPagina');
const LogAtividade   = require('./LogAtividade');
const Ativo          = require('./Ativo');
const Pedido         = require('./Pedido');

/* ── Associações ── */

// Cliente pertence a um gestor (Utilizador)
Cliente.belongsTo(Utilizador, { as: 'gestor',    foreignKey: 'gestor_id' });
Cliente.belongsTo(Utilizador, { as: 'utilizador', foreignKey: 'utilizador_id' });

// Incidente pertence a um cliente, foi reportado por e tem responsável (Utilizador)
Incidente.belongsTo(Cliente,    { as: 'cliente',    foreignKey: 'cliente_id' });
Incidente.belongsTo(Utilizador, { as: 'reportador', foreignKey: 'reportado_por' });
Incidente.belongsTo(Utilizador, { as: 'responsavel', foreignKey: 'responsavel_id' });

// Documento pertence a um cliente e foi criado por um utilizador
Documento.belongsTo(Cliente,    { as: 'cliente',  foreignKey: 'cliente_id' });
Documento.belongsTo(Utilizador, { as: 'criador',  foreignKey: 'criado_por' });

// Notícia foi criada por um admin (Utilizador)
Noticia.belongsTo(Utilizador, { as: 'autor', foreignKey: 'criado_por' });

// Log pertence a um utilizador
LogAtividade.belongsTo(Utilizador, { as: 'utilizador', foreignKey: 'utilizador_id' });

// Ativo pertence a um cliente
Ativo.belongsTo(Cliente, { as: 'cliente', foreignKey: 'cliente_id' });
Cliente.hasMany(Ativo,   { as: 'ativos',  foreignKey: 'cliente_id' });

// Pedido pertence a um cliente e pode ter uma resposta de um utilizador (gestor)
Pedido.belongsTo(Cliente,    { as: 'cliente',    foreignKey: 'cliente_id' });
Pedido.belongsTo(Utilizador, { as: 'respondedor', foreignKey: 'respondido_por' });
Cliente.hasMany(Pedido,   { as: 'pedidos', foreignKey: 'cliente_id' });

module.exports = {
  Utilizador, Cliente, Incidente, Documento, Servico, Mensagem,
  Noticia, Contacto, ConteudoPagina, LogAtividade, Ativo, Pedido,
};
