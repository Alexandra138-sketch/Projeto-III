/**
 * seed.js — Cria (ou atualiza) utilizadores de teste na base de dados
 * Executar uma vez a partir da pasta backend/src:
 *   node seed.js
 */

require('dotenv').config();
const bcrypt    = require('bcryptjs');
const sequelize = require('./config/database');
const Utilizador = require('./models/Utilizador');

const UTILIZADORES = [
  { nome: 'Administrador', email: 'admin@cyberboxsecur.pt',      password: 'Admin@1234',  perfil: 'admin'   },
  { nome: 'João Silva',    email: 'joao.silva@cyberboxsecur.pt', password: 'Gestor@1234', perfil: 'gestor'  },
  { nome: 'Tech Corp',     email: 'seguranca@techcorp.pt',        password: 'Empresa@1234',perfil: 'empresa' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à base de dados estabelecida\n');

    for (const u of UTILIZADORES) {
      const hash = await bcrypt.hash(u.password, 10);

      const [utilizador, criado] = await Utilizador.findOrCreate({
        where: { email: u.email },
        defaults: {
          nome:     u.nome,
          email:    u.email,
          password: hash,
          perfil:   u.perfil,
          estado:   'Ativo',
        },
      });

      if (criado) {
        console.log(`✅ Criado:    [${u.perfil.padEnd(7)}] ${u.email}`);
      } else {
        // Atualiza a password mesmo que o utilizador já exista
        await utilizador.update({ password: hash, nome: u.nome, perfil: u.perfil, estado: 'Ativo' });
        console.log(`🔄 Atualizado: [${u.perfil.padEnd(7)}] ${u.email}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Credenciais de acesso ao site:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const u of UTILIZADORES) {
      console.log(`  ${u.perfil.padEnd(8)} │ ${u.email.padEnd(36)} │ ${u.password}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao executar seed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
