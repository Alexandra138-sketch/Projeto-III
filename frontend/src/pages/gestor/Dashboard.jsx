import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

const STA_BADGE = {
  'Aberto':       'badge bg-primary',
  'A Investigar': 'badge bg-warning text-dark',
  'Resolvido':    'badge bg-success',
  'Fechado':      'badge bg-secondary',
};

const DOC_EST_BADGE = {
  'Ativo':      'badge bg-success',
  'Em Revisão': 'badge bg-warning text-dark',
  'Expirado':   'badge bg-danger',
};

function GestorDashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Gestor';

  const [clientes,   setClientes]   = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/incidentes'), api.get('/documentos')])
      .then(([c, i, d]) => { setClientes(c.data); setIncidentes(i.data); setDocumentos(d.data); })
      .catch((err) => console.error('Erro ao carregar dashboard:', err))
      .finally(() => setCarregando(false));
  }, []);

  const incAbertos  = incidentes.filter((i) => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const incCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado' && i.estado !== 'Resolvido').length;
  const docsAtivos  = documentos.filter((d) => d.estado === 'Ativo').length;

  const incRecentes  = [...incidentes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const docsRecentes = [...documentos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  return (
    <AdminLayout>

      {/* Banner de boas-vindas */}
      <div className="card bg-primary text-white mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Olá, {primeiroNome} 👋</h4>
          <p className="mb-3 opacity-75">Aqui está o resumo das atividades dos seus clientes.</p>
          <div className="row g-3">
            {[
              { numero: clientes.length,  label: 'Clientes'          },
              { numero: incAbertos,       label: 'Incidentes Abertos' },
              { numero: incCriticos,      label: 'Críticos Ativos'    },
              { numero: docsAtivos,       label: 'Documentos Ativos'  },
            ].map((s) => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card bg-white bg-opacity-25 text-white border-0">
                  <div className="card-body text-center py-3">
                    <h3 className="fw-bold mb-1">{carregando ? '…' : s.numero}</h3>
                    <p className="mb-0 small">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incidentes + Clientes */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">⚠ Incidentes Recentes</span>
              <Link to="/gestor/incidentes" className="btn btn-sm btn-outline-primary">Ver todos</Link>
            </div>
            <div className="card-body p-0">
              {carregando ? (
                <div className="text-center py-4 text-muted"><div className="spinner-border spinner-border-sm" role="status"></div></div>
              ) : incRecentes.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">Sem incidentes registados.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {incRecentes.map((inc) => (
                    <li key={inc.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-0 fw-semibold small">{inc.titulo}</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                          {inc.cliente?.nome || '—'} · {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : ''}
                        </p>
                      </div>
                      <span className={STA_BADGE[inc.estado] || 'badge bg-secondary'}>{inc.estado}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">👥 Os Meus Clientes</span>
              <Link to="/gestor/clientes" className="btn btn-sm btn-outline-primary">Ver todos</Link>
            </div>
            <div className="card-body p-0">
              {carregando ? (
                <div className="text-center py-4 text-muted"><div className="spinner-border spinner-border-sm" role="status"></div></div>
              ) : clientes.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">Sem clientes atribuídos.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {clientes.slice(0, 5).map((c) => (
                    <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 36, height: 36, background: '#2563eb', fontSize: 13, flexShrink: 0 }}>
                          {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="mb-0 fw-semibold small">{c.nome}</p>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{c.email}</p>
                        </div>
                      </div>
                      <span className={`badge ${c.estado === 'Ativo' ? 'bg-success' : 'bg-secondary'}`}>{c.estado}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Documentos recentes */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold">📄 Documentos Recentes</span>
          <Link to="/gestor/documentos" className="btn btn-sm btn-outline-primary">Ver todos</Link>
        </div>
        <div className="card-body">
          {carregando ? (
            <div className="text-center py-3 text-muted"><div className="spinner-border spinner-border-sm" role="status"></div></div>
          ) : docsRecentes.length === 0 ? (
            <p className="text-center text-muted mb-0">Sem documentos.</p>
          ) : (
            <div className="row g-3">
              {docsRecentes.map((doc) => (
                <div key={doc.id} className="col-12 col-sm-6 col-xl-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className={DOC_EST_BADGE[doc.estado] || 'badge bg-secondary'}>{doc.estado}</span>
                        <span className="badge bg-light text-muted border">{doc.tipo}</span>
                      </div>
                      <p className="fw-semibold small mb-1">{doc.titulo}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{doc.cliente?.nome || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distribuição de severidade */}
      {!carregando && incidentes.length > 0 && (
        <div className="card">
          <div className="card-header fw-semibold">📊 Distribuição de Incidentes por Severidade</div>
          <div className="card-body">
            <div className="row g-3">
              {[
                { label: 'Crítico', bg: 'bg-danger'  },
                { label: 'Alto',    bg: 'bg-warning'  },
                { label: 'Médio',   bg: 'bg-primary'  },
                { label: 'Baixo',   bg: 'bg-success'  },
              ].map(({ label, bg }) => {
                const count = incidentes.filter((i) => i.severidade === label).length;
                return (
                  <div key={label} className="col-6 col-md-3">
                    <div className={`card text-white ${bg}`}>
                      <div className="card-body text-center py-3">
                        <h3 className="fw-bold mb-1">{count}</h3>
                        <p className="mb-0 small">{label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default GestorDashboard;
