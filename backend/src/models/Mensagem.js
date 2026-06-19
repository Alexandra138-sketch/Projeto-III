const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilizador = require('./Utilizador');

const Mensagem = sequelize.define('Mensagem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  remetente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'mensagens',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false,
});

Mensagem.belongsTo(Utilizador, { as: 'remetente', foreignKey: 'remetente_id' });

// Nota: a tabela 'mensagens' é gerida pelo Neon Tech.
// Não se usa sync() aqui — a base de dados já tem a tabela criada.

module.exports = Mensagem;
