// node debug_login.js
// Testa o login directamente sem servidor

require('dotenv').config({ path: './src/.env' });
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'postgres', logging: false }
);

const Utilizador = sequelize.define('Utilizador', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome:     DataTypes.STRING,
  email:    { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  perfil:   DataTypes.STRING,
}, { tableName: 'utilizadores', timestamps: true, underscored: true });

(async () => {
  try {
    await sequelize.authenticate();

    // Mostra TODOS os utilizadores e o hash guardado
    const users = await Utilizador.findAll({ attributes: ['id','nome','email','perfil','password'] });
    console.log(`\n${users.length} utilizador(es) na BD:\n`);

    for (const u of users) {
      console.log(`  email:  ${u.email}`);
      console.log(`  perfil: ${u.perfil}`);
      console.log(`  hash:   ${u.password}`);

      // Testa várias passwords possíveis
      const candidatas = ['demo1234','Demo1234','admin1234','Admin1234','password','123456','admin','cyberbox'];
      for (const p of candidatas) {
        const ok = await bcrypt.compare(p, u.password);
        if (ok) console.log(`  ✅ PASSWORD CORRECTA: "${p}"`);
      }
      console.log();
    }
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await sequelize.close();
  }
})();
