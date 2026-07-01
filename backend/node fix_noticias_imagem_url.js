/**
 * fix_noticias_imagem_url.js
 *
 * PROBLEMA:
 * A coluna "imagem_url" da tabela "noticias" foi criada como VARCHAR(255).
 * Quando o admin faz upload de uma imagem no painel (Conteúdos > Notícias),
 * o frontend converte o ficheiro para base64 (data:image/png;base64,...),
 * que tem SEMPRE muito mais de 255 caracteres. O Postgres rejeita esse
 * INSERT/UPDATE com o erro "value too long for type character varying(255)",
 * e por isso a notícia nunca chega a ser criada/publicada.
 *
 * CORREÇÃO:
 * Este script altera a coluna para TEXT (sem limite de tamanho) diretamente
 * na base de dados. É necessário correr isto MESMO depois de já teres
 * atualizado o ficheiro src/models/Noticia.js, porque o Sequelize não altera
 * colunas já existentes sozinho.
 *
 * Como executar (a partir da pasta backend/):
 *   node fix_noticias_imagem_url.js
 */

const sequelize = require('./src/config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à BD OK\n');

    await sequelize.query(`ALTER TABLE noticias ALTER COLUMN imagem_url TYPE TEXT;`);

    console.log('✅ Coluna "imagem_url" da tabela "noticias" alterada para TEXT com sucesso.');
    console.log('   Já podes publicar notícias com imagens carregadas do computador.');
  } catch (err) {
    console.error('❌ Erro ao alterar a coluna:', err.message);
  } finally {
    await sequelize.close();
  }
}

fix();