// ─────────────────────────────────────────────────────────────
//  Modelo: Contacto
//  Representa a tabela "contactos" na base de dados.
//  Mensagens enviadas pelo formulário de contacto do site público.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contacto = sequelize.define('Contacto', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  telefone: {
    type: DataTypes.STRING,
  },

  assunto: {
    type: DataTypes.STRING,
  },

  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // false = não lido (novo), true = já visto pelo admin
  lido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'contactos',
  timestamps: true,
  underscored: true,
  updatedAt: false, // a tabela só tem created_at
});

module.exports = Contacto;
