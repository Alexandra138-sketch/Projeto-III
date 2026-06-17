// ─────────────────────────────────────────────────────────────
//  Modelo: Cliente
//  Representa a tabela "clientes" na base de dados.
//  Cada cliente é uma empresa que contratou os serviços.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {

  // Chave primária — gerada automaticamente pela base de dados
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Informação básica do cliente (empresa)
  nome: {
    type: DataTypes.STRING,
    allowNull: false, // campo obrigatório
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
  },

  // Estado da conta: 'Ativo' ou 'Inativo'
  // Usado para revogar o acesso sem apagar o cliente
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Ativo',
  },

  // Ligação ao utilizador que faz login como esta empresa
  utilizador_id: {
    type: DataTypes.INTEGER,
  },

  // Gestor responsável por acompanhar este cliente
  gestor_id: {
    type: DataTypes.INTEGER,
  },

  // ── Responsável de Segurança ──────────────────────────────
  // Pessoa de contacto na empresa para assuntos de segurança
  resp_seguranca_nome: {
    type: DataTypes.STRING,
  },
  resp_seguranca_email: {
    type: DataTypes.STRING,
  },
  resp_seguranca_telefone: {
    type: DataTypes.STRING,
  },

  // ── Contacto Permanente ───────────────────────────────────
  // Pessoa sempre disponível para contacto de emergência
  contacto_perm_nome: {
    type: DataTypes.STRING,
  },
  contacto_perm_email: {
    type: DataTypes.STRING,
  },
  contacto_perm_telefone: {
    type: DataTypes.STRING,
  },

}, {
  tableName: 'clientes',   // nome exato da tabela na BD
  timestamps: true,        // cria automaticamente created_at e updated_at
  underscored: true,       // usa snake_case nas colunas (ex: gestor_id)
});

module.exports = Cliente;
