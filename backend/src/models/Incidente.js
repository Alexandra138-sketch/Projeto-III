// ─────────────────────────────────────────────────────────────
//  Modelo: Incidente
//  Representa a tabela "incidentes" na base de dados.
//  Regista ocorrências de segurança associadas a um cliente.
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incidente = sequelize.define('Incidente', {

  // Chave primária — gerada automaticamente
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Título curto que identifica o incidente
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Descrição detalhada do que aconteceu
  descricao: {
    type: DataTypes.TEXT,
  },

  // Nível de gravidade: 'Crítico', 'Alto', 'Médio' ou 'Baixo'
  severidade: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Médio',
  },

  // Estado atual do incidente no processo de resolução
  // 'Aberto' → 'A Investigar' → 'Resolvido' → 'Fechado'
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Aberto',
  },

  // Indica se o incidente foi reportado às autoridades (NIS2)
  // A diretiva NIS2 obriga a notificar incidentes graves em 24h/72h
  nis2_notificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // A qual cliente pertence este incidente
  cliente_id: {
    type: DataTypes.INTEGER,
  },

  // Quem registou o incidente no sistema
  reportado_por: {
    type: DataTypes.INTEGER,
  },

  // Gestor ou técnico responsável por resolver o incidente
  responsavel_id: {
    type: DataTypes.INTEGER,
  },

  // Data em que o incidente ocorreu (pode ser diferente da data de registo)
  data_ocorrencia: {
    type: DataTypes.DATE,
  },

  // Data em que o incidente foi resolvido
  data_resolucao: {
    type: DataTypes.DATE,
  },

}, {
  tableName: 'incidentes',  // nome exato da tabela na BD
  timestamps: true,          // cria created_at e updated_at automaticamente
  underscored: true,         // usa snake_case nas colunas
});

module.exports = Incidente;
