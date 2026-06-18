const { LogAtividade, Utilizador } = require('../models');

const log_list = async (req, res) => {
  try {
    const logs = await LogAtividade.findAll({
      include: [
        { model: Utilizador, as: 'utilizador', attributes: ['id', 'nome', 'email', 'perfil'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 200,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const registar_log = async (utilizador_id, acao_efetuada, detalhes_auditoria) => {
  try {
    await LogAtividade.create({ utilizador_id, acao_efetuada, detalhes_auditoria });
  } catch (err) {
    console.error('Erro ao registar log:', err.message);
  }
};

module.exports = { log_list, registar_log };
