import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { Search, Activity, Loader, LogIn, FileText, AlertTriangle, User } from 'lucide-react';

const ACAO_CFG = {
  'Iniciou sessão':     { bg: '#dbeafe', cor: '#2563eb',  icone: LogIn       },
  'Criou documento':    { bg: '#dcfce7', cor: '#16a34a',  icone: FileText    },
  'Editou documento':   { bg: '#fef9c3', cor: '#ca8a04',  icone: FileText    },
  'Eliminou documento': { bg: '#fee2e2', cor: '#dc2626',  icone: FileText    },
  'Criou incidente':    { bg: '#ede9fe', cor: '#7c3aed',  icone: AlertTriangle },
  'Editou incidente':   { bg: '#fff7ed', cor: '#c2410c',  icone: AlertTriangle },
  'Eliminou incidente': { bg: '#fee2e2', cor: '#dc2626',  icone: AlertTriangle },
};

function getAcaoCfg(acao) {
  return ACAO_CFG[acao] || { bg: '#f1f5f9', cor: '#475569', icone: Activity };
}

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
    const matchP = l.acao_efetuada?.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   l.utilizador?.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   l.detalhes_auditoria?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchA = filtroAcao === 'all' || l.acao_efetuada === filtroAcao;
    return matchP && matchA;
  });

  return (
    <AdminLayout>

      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Logs de Atividade</h4>
          <p className="incidentes-subtitulo">
            {carregando ? 'A carregar…' : `${logs.length} registos de atividade`}
          </p>
        </div>
      </div>

      <div className="resumo-cards">
        {[
          {
            numero: carregando ? '…' : logs.filter((l) => l.acao_efetuada === 'Iniciou sessão').length,
            label: 'Logins',
            classe: 'card-aberto',
          },
          {
            numero: carregando ? '…' : logs.filter((l) => l.acao_efetuada?.includes('documento')).length,
            label: 'Ações em Docs',
            classe: 'card-nis2',
          },
          {
            numero: carregando ? '…' : logs.filter((l) => l.acao_efetuada?.includes('incidente')).length,
            label: 'Ações em Inc.',
            classe: 'card-critico',
          },
          {
            numero: carregando ? '…' : logs.length,
            label: 'Total',
            classe: 'card-total',
          },
        ].map(({ numero, label, classe }) => (
          <div key={label} className={`resumo-card ${classe}`}>
            <p className="resumo-numero">{numero}</p>
            <p className="resumo-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="dash-card filtros-bar">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input
              placeholder="Pesquisar logs…"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
          <select value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)}>
            <option value="all">Todas as ações</option>
            {acoes.map((a) => <option key={a}>{a}</option>)}
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar logs…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          <Activity size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>Nenhum registo encontrado.</p>
        </div>
      ) : filtrados.map((log) => {
        const cfg   = getAcaoCfg(log.acao_efetuada);
        const Icone = cfg.icone;
        return (
          <div key={log.id} className="dash-card incidente-card">
            <div className="d-flex align-items-start gap-3">
              <div style={{ background: cfg.bg, borderRadius: 10, padding: '0.6rem', flexShrink: 0 }}>
                <Icone size={18} color={cfg.cor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <p className="incidente-nome">{log.acao_efetuada}</p>
                </div>
                {log.detalhes_auditoria && (
                  <p className="incidente-descricao">{log.detalhes_auditoria}</p>
                )}
                <div className="d-flex flex-wrap gap-3">
                  {log.utilizador?.nome && (
                    <span className="incidente-data" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> {log.utilizador.nome}
                      {log.utilizador.perfil && ` (${log.utilizador.perfil})`}
                    </span>
                  )}
                  {log.created_at && (
                    <span className="incidente-data">
                      {new Date(log.created_at).toLocaleDateString('pt-PT')}
                      {' '}
                      {new Date(log.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

    </AdminLayout>
  );
}

export default AdminLogs;
