const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incidente = sequelize.define('Incidente', {
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
  },
  severidade: {
    type: DataTypes.ENUM('Crítico', 'Alto', 'Médio', 'Baixo'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('Aberto', 'A Investigar', 'Resolvido', 'Fechado'),
    defaultValue: 'Aberto',
  },
  nis2_notificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
  },
  reportado_por: {
    type: DataTypes.INTEGER,
  },
  responsavel_id: {
    type: DataTypes.INTEGER,
  },
  data_resolucao: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'incidentes',
  timestamps: true,
  underscored: true,
});

module.exports = Incidente;