// ─────────────────────────────────────────────────────────────
//  Modelo: Pedido
//  Representa a tabela "pedidos" na base de dados.
//  Permite que as empresas submetam questões e pedidos de suporte
//  ao gestor responsável. O gestor pode responder e alterar o estado.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Ligação ao cliente que fez o pedido
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },

  // Tipo de pedido: Questão, Pedido de Suporte, Pedido de Pentest, Outro
  tipo: {
    type: DataTypes.STRING(50),
    defaultValue: 'Questão',
  },

  // Assunto resumido do pedido (como o subject de um e-mail)
  assunto: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },

  // Descrição detalhada do pedido ou questão
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Estado atual do pedido: Pendente → Em Análise → Resolvido → Fechado
  estado: {
    type: DataTypes.STRING(50),
    defaultValue: 'Pendente',
  },

  // Resposta do gestor ao pedido
  resposta: {
    type: DataTypes.TEXT,
  },

  // ID do utilizador (gestor/admin) que respondeu
  respondido_por: {
    type: DataTypes.INTEGER,
  },

}, {
  tableName: 'pedidos',
  timestamps: true,
  underscored: true,
});

module.exports = Pedido;
