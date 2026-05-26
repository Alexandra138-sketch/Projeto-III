const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilizador = sequelize.define('Utilizador', {
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
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
  },
  perfil: {
    type: DataTypes.ENUM('admin', 'gestor', 'empresa'),
    allowNull: false,
    defaultValue: 'empresa',
  },
  estado: {
    type: DataTypes.ENUM('Ativo', 'Inativo'),
    defaultValue: 'Ativo',
  },
  foto: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'utilizadores',
  timestamps: true,
  underscored: true,
});

module.exports = Utilizador;