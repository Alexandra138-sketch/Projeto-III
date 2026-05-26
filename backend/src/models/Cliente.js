const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
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
  estado: {
    type: DataTypes.ENUM('Ativo', 'Inativo'),
    defaultValue: 'Ativo',
  },
  utilizador_id: {
    type: DataTypes.INTEGER,
  },
  gestor_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'clientes',
  timestamps: true,
  underscored: true,
});

module.exports = Cliente;