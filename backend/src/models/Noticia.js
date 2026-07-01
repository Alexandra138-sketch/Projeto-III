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

  // URL da imagem de capa (pode ser Unsplash ou upload em base64)
  // IMPORTANTE: tem de ser TEXT e não STRING, porque quando o admin faz
  // upload de uma imagem no painel, ela é guardada como base64 (data:image/...)
  // que facilmente ultrapassa os 255 caracteres do VARCHAR por defeito do
  // STRING. Isso fazia o Postgres rejeitar o INSERT/UPDATE com o erro
  // "value too long for type character varying(255)" e a notícia nunca
  // era criada/publicada.
  imagem_url: {
    type: DataTypes.TEXT,
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