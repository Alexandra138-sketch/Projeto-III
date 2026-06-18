/**
 * fix_empresa_link.js
 * Liga o utilizador "empresa" ao registo cliente correspondente
 * pelo email. Executar uma vez:
 *   node fix_empresa_link.js
 */

const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à BD OK\n');

    // Buscar todos os utilizadores com perfil 'empresa'
    const empresaUsers = await sequelize.query(
      `SELECT id, nome, email FROM utilizadores WHERE perfil = 'empresa'`,
      { type: QueryTypes.SELECT }
    );

    if (empresaUsers.length === 0) {
      console.log('⚠️  Nenhum utilizador com perfil "empresa" encontrado.');
      return;
    }

    for (const user of empresaUsers) {
      // Tentar encontrar cliente com mesmo email
      const clientes = await sequelize.query(
        `SELECT id, nome, email, utilizador_id FROM clientes WHERE email = :email`,
        { replacements: { email: user.email }, type: QueryTypes.SELECT }
      );

      if (clientes.length === 0) {
        // Tentar pelo nome
        const clientesPorNome = await sequelize.query(
          `SELECT id, nome, email, utilizador_id FROM clientes WHERE LOWER(nome) = LOWER(:nome)`,
          { replacements: { nome: user.nome }, type: QueryTypes.SELECT }
        );

        if (clientesPorNome.length === 0) {
          console.log(`⚠️  Utilizador ${user.email} — nenhum cliente encontrado por email ou nome.`);
          continue;
        }

        const c = clientesPorNome[0];
        if (c.utilizador_id === user.id) {
          console.log(`✅ ${user.email} já está ligado ao cliente "${c.nome}"`);
          continue;
        }

        await sequelize.query(
          `UPDATE clientes SET utilizador_id = :uid WHERE id = :cid`,
          { replacements: { uid: user.id, cid: c.id }, type: QueryTypes.UPDATE }
        );
        console.log(`🔗 Ligado: ${user.email} → cliente "${c.nome}" (id=${c.id})`);
        continue;
      }

      const c = clientes[0];
      if (c.utilizador_id === user.id) {
        console.log(`✅ ${user.email} já está ligado ao cliente "${c.nome}"`);
        continue;
      }

      await sequelize.query(
        `UPDATE clientes SET utilizador_id = :uid WHERE id = :cid`,
        { replacements: { uid: user.id, cid: c.id }, type: QueryTypes.UPDATE }
      );
      console.log(`🔗 Ligado: ${user.email} → cliente "${c.nome}" (id=${c.id})`);
    }

    console.log('\n✅ Concluído.');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
  }
}

fix();
