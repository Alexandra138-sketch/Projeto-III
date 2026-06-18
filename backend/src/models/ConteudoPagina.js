// ─────────────────────────────────────────────────────────────
//  Modelo: ConteudoPagina
//  Representa a tabela "conteudo_paginas" na base de dados.
//  Guarda textos editáveis das páginas públicas do site
//  (ex: título e subtítulo do hero da página principal).
//
//  Cada linha é identificada por (pagina + seccao), ex:
//    pagina='principal', seccao='hero'
//    pagina='principal', seccao='servicos_header'
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConteudoPagina = sequelize.define('ConteudoPagina', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Identificador da página: 'principal', 'servicos', 'noticias'
  pagina: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  // Identificador da secção: 'hero', 'servicos_header'
  seccao: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  // Texto principal da secção
  titulo: {
    type: DataTypes.STRING,
  },

  // Texto secundário/descritivo
  subtitulo: {
    type: DataTypes.TEXT,
  },

}, {
  tableName: 'conteudo_paginas',
  timestamps: true,
  underscored: true,
  createdAt: false,       // a tabela só tem updated_at
  updatedAt: 'updated_at',
});

module.exports = ConteudoPagina;
