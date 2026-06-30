// ─────────────────────────────────────────────────────────────
//  Modelo: Ativo
//  Representa a tabela "ativos_tecnologicos" na base de dados.
//  Regista os equipamentos e sistemas de uma empresa cliente,
//  seguindo a estrutura do inventário CNCS/NIS2.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ativo = sequelize.define('Ativo', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Ligação ao cliente dono do ativo
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },

  // Número único de inventário interno da empresa
  numero_inventario: { type: DataTypes.STRING(50) },

  // Tipo de equipamento (ex: Servidor, Switch, Firewall)
  tipo_equipamento: { type: DataTypes.STRING(100) },

  // Nome identificativo do ativo (obrigatório)
  nome: { type: DataTypes.STRING(200), allowNull: false },

  tipologia:         { type: DataTypes.STRING(100) },
  modelo:            { type: DataTypes.STRING(100) },
  numero_serie:      { type: DataTypes.STRING(100) },
  fabricante:        { type: DataTypes.STRING(100) },
  localizacao:       { type: DataTypes.STRING(200) },
  sistema_operativo: { type: DataTypes.STRING(100) },

  // Nível de criticidade: Residual, Baixa, Média, Alta, Crítica
  criticidade: { type: DataTypes.STRING(20) },

  ip:              { type: DataTypes.STRING(50) },
  mac:             { type: DataTypes.STRING(50) },
  responsavel:     { type: DataTypes.STRING(100) },
  contacto:        { type: DataTypes.STRING(100) },
  unidade_organica:{ type: DataTypes.STRING(100) },
  aplicacoes:      { type: DataTypes.TEXT },
  observacoes:     { type: DataTypes.TEXT },

}, {
  tableName: 'ativos_tecnologicos',
  timestamps: true,
  underscored: true,
});

module.exports = Ativo;
