const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descricao_longa: {
    type: DataTypes.TEXT,
  },
  icone: {
    type: DataTypes.STRING,
  },
  nis2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'servicos',
  timestamps: true,
});

module.exports = Servico;