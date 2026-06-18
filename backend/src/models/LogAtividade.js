const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAtividade = sequelize.define('LogAtividade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  acao_efetuada: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  detalhes_auditoria: {
    type: DataTypes.TEXT,
  },
  utilizador_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'registos_logs',
  timestamps: true,
  underscored: true,
});

module.exports = LogAtividade;
