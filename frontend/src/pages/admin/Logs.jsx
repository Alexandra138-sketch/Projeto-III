import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

function AdminLogs() {
  const [logs,       setLogs]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa,   setPesquisa]   = useState('');
  const [filtroAcao, setFiltroAcao] = useState('all');

  useEffect(() => {
    api.get('/logs')
      .then((r) => setLogs(r.data))
      .catch((err) => console.error('Erro ao carregar logs:', err))
      .finally(() => setCarregando(false));
  }, []);

  const acoes = [...new Set(logs.map((l) => l.acao_efetuada))];

  const filtrados = logs.filter((l) => {
    const matchP =
      l.acao_efetuada?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      l.utilizador?.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      l.detalhes_auditoria?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchA = filtroAcao === 'all' || l.acao_efetuada === filtroAcao;
    return matchP && matchA;
  });

  const totalLogins   = logs.filter((l) => l.acao_efetuada === 'Iniciou sessão').length;
  const totalDocs     = logs.filter((l) => l.acao_efetuada?.includes('documento')).length;
  const totalInc      = logs.filter((l) => l.acao_efetuada?.includes('incidente')).length;

  /* ── Badge de ação ── */
  const badgeAcao = (acao) => {
    if (acao === 'Iniciou sessão')      return 'badge bg-primary';
    if (acao?.includes('Criou'))        return 'badge bg-success';
    if (acao?.includes('Editou'))       return 'badge bg-warning text-dark';
    if (acao?.includes('Eliminou'))     return 'badge bg-danger';
    return 'badge bg-secondary';
  };

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Logs de Atividade</h4>
          <p className="text-muted mb-0">
            {carregando ? 'A carregar…' : `${logs.length} registos de atividade`}
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="row g-3 mb-4">
        {[
          { numero: carregando ? '…' : totalLogins, label: 'Logins',         bg: 'bg-primary' },
          { numero: carregando ? '…' : totalDocs,   label: 'Ações em Docs',  bg: 'bg-success' },
          { numero: carregando ? '…' : totalInc,    label: 'Ações em Inc.',  bg: 'bg-warning' },
          { numero: carregando ? '…' : logs.length, label: 'Total',          bg: 'bg-secondary' },
        ].map(({ numero, label, bg }) => (
          <div key={label} className="col-6 col-md-3">
            <div className={`card text-white ${bg}`}>
              <div className="card-body text-center py-3">
                <h3 className="fw-bold mb-1">{numero}</h3>
                <p className="mb-0 small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Pesquisar por ação, utilizador ou detalhe…"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroAcao}
                onChange={(e) => setFiltroAcao(e.target.value)}
              >
                <option value="all">Todas as ações</option>
                {acoes.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-end">
              <span className="text-muted small">{filtrados.length} resultado(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de logs */}
      {carregando ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border mb-3" role="status"></div>
          <p>A carregar logs…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            <p className="fs-4 mb-1">📋</p>
            <p className="mb-0">Nenhum registo encontrado.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Ação</th>
                <th>Detalhes</th>
                <th>Utilizador</th>
                <th>Perfil</th>
                <th>Data e Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((log, index) => (
                <tr key={log.id}>
                  <td className="text-muted small">{index + 1}</td>
                  <td>
                    <span className={badgeAcao(log.acao_efetuada)}>
                      {log.acao_efetuada}
                    </span>
                  </td>
                  <td className="text-muted small">{log.detalhes_auditoria || '—'}</td>
                  <td className="fw-semibold">{log.utilizador?.nome || '—'}</td>
                  <td>
                    {log.utilizador?.perfil && (
                      <span className="badge bg-light text-dark border">
                        {log.utilizador.perfil}
                      </span>
                    )}
                  </td>
                  <td className="text-muted small">
                    {log.created_at
                      ? `${new Date(log.created_at).toLocaleDateString('pt-PT')} ${new Date(log.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </AdminLayout>
  );
}

export default AdminLogs;
