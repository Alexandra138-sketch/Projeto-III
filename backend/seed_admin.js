// Corre UMA vez: node seed_admin.js
// Cria o utilizador admin na base de dados

require('dotenv').config({ path: './src/.env' });
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'postgres', logging: false }
);

const Utilizador = sequelize.define('Utilizador', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome:     { type: DataTypes.STRING,  allowNull: false },
  email:    { type: DataTypes.STRING,  allowNull: false, unique: true },
  password: { type: DataTypes.STRING,  allowNull: false },
  telefone: { type: DataTypes.STRING },
  perfil:   { type: DataTypes.ENUM('admin','gestor','empresa'), defaultValue: 'empresa' },
  estado:   { type: DataTypes.ENUM('Ativo','Inativo'), defaultValue: 'Ativo' },
  foto:     { type: DataTypes.STRING },
}, { tableName: 'utilizadores', timestamps: true, underscored: true });

const utilizadores = [
  { nome: 'Admin Principal',  email: 'admin@cyberboxsecur.pt',      password: 'demo1234',   perfil: 'admin',   telefone: '+351 912 000 001' },
  { nome: 'João Silva',       email: 'joao.silva@cyberboxsecur.pt', password: 'demo1234',  perfil: 'gestor',  telefone: '+351 913 000 002' },
  { nome: 'Ana Costa',        email: 'ana.costa@cyberboxsecur.pt',  password: 'demo1234',  perfil: 'gestor',  telefone: '+351 914 000 003' },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à BD OK');

    for (const u of utilizadores) {
      const existe = await Utilizador.findOne({ where: { email: u.email } });
      if (existe) {
        // Atualiza a password para garantir que está correta
        const hash = await bcrypt.hash(u.password, 10);
        await existe.update({ password: hash });
        console.log(`🔄 Atualizado: ${u.email} (password reposta para "${u.password}")`);
      } else {
        const hash = await bcrypt.hash(u.password, 10);
        await Utilizador.create({ ...u, password: hash });
        console.log(`✅ Criado: ${u.email} (password: "${u.password}")`);
      }
    }

    console.log('\n🎉 Seed concluído. Credenciais:');
    console.log('   admin@cyberboxsecur.pt  /  demo1234');
    console.log('   joao.silva@cyberboxsecur.pt  /  demo1234');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
  }
})();
