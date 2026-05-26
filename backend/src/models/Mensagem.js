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

// Cria a tabela automaticamente se não existir
Mensagem.sync({ alter: true }).catch((err) =>
  console.error('[Mensagem] Erro ao sincronizar tabela:', err.message)
);

module.exports = Mensagem;
