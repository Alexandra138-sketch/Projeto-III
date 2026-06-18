// ─────────────────────────────────────────────────────────────
//  Modelo: Noticia
//  Representa a tabela "noticias" na base de dados.
//  Artigos de cibersegurança exibidos na página pública.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Noticia = sequelize.define('Noticia', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Título do artigo
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Texto curto exibido na listagem (preview)
  resumo: {
    type: DataTypes.TEXT,
  },

  // Texto completo do artigo
  conteudo: {
    type: DataTypes.TEXT,
  },

  // Ex: 'NIS2', 'Ameaças', 'Boas Práticas', 'Conformidade'
  categoria: {
    type: DataTypes.STRING,
  },

  // URL da imagem de capa (pode ser Unsplash ou upload)
  imagem_url: {
    type: DataTypes.STRING,
  },

  // Ex: '5 min', '10 min'
  tempo_leitura: {
    type: DataTypes.STRING,
  },

  // false = rascunho, true = visível no site público
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Quem criou o artigo (admin)
  criado_por: {
    type: DataTypes.INTEGER,
  },

}, {
  tableName: 'noticias',
  timestamps: true,
  underscored: true,
});

module.exports = Noticia;
