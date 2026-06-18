const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Documento = sequelize.define('Documento', {
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
  tipo: {
    type: DataTypes.STRING,
    allowNull: false, // valores possíveis: 'Política', 'Pentest', 'Auditoria', 'Contrato', 'Relatório'
  },
  versao: {
    type: DataTypes.STRING,
    defaultValue: 'v1.0',
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Ativo', // valores possíveis: 'Ativo', 'Em Revisão', 'Expirado'
  },
  ficheiro: {
    type: DataTypes.STRING,
  },
  tamanho: {
    type: DataTypes.STRING,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
  },
  criado_por: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'documentos',
  timestamps: true,
  underscored: true,
});

module.exports = Documento;