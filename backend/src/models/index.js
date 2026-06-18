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

// Mensagem pertence a um remetente (Utilizador) — já definido em Mensagem.js
// (não redefinir aqui para evitar duplicação)

// Log pertence a um utilizador
LogAtividade.belongsTo(Utilizador, { as: 'utilizador', foreignKey: 'utilizador_id' });

module.exports = {
  Utilizador, Cliente, Incidente, Documento, Servico, Mensagem,
  Noticia, Contacto, ConteudoPagina, LogAtividade,
};
