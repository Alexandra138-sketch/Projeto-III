import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

const STATS = [
  { numero: 12, label: 'Utilizadores Ativos' },
  { numero: 4,  label: 'Incidentes Abertos'  },
  { numero: 3,  label: 'Pentests Ativos'     },
  { numero: 27, label: 'Documentos'          },
];

const INCIDENTES_RECENTES = [
  { id: 1, nome: 'Ransomware - Servidores de Ficheiros', data: '2025-02-10', estado: 'Resolvido',     bg: 'bg-success' },
  { id: 2, nome: 'Phishing Campaign - Executivos',      data: '2025-03-10', estado: 'A Investigar',  bg: 'bg-warning text-dark' },
  { id: 3, nome: 'SQL Injection - Portal Cliente',      data: '2025-04-01', estado: 'Crítico',        bg: 'bg-danger'  },
  { id: 4, nome: 'Acesso Não Autorizado - VPN',         data: '2025-04-15', estado: 'Aberto',         bg: 'bg-primary' },
];

const CLIENTES = [
  { id: 1, nome: 'Tech Corp Portugal', email: 'seguranca@techcorp.pt', ativo: true  },
  { id: 2, nome: 'Retail Group SA',    email: 'it@retailgroup.pt',     ativo: true  },
  { id: 3, nome: 'FinBank Portugal',   email: 'ciso@finbank.pt',       ativo: true  },
  { id: 4, nome: 'MediSafe Clinic',    email: 'admin@medisafe.pt',     ativo: false },
];

const SEVERIDADE_DADOS = [
  { label: 'Crítico', valor: 2, total: 6, cor: 'bg-danger'  },
  { label: 'Alto',    valor: 2, total: 6, cor: 'bg-warning' },
  { label: 'Médio',   valor: 1, total: 6, cor: 'bg-primary' },
  { label: 'Baixo',   valor: 1, total: 6, cor: 'bg-success' },
];

function Dashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Admin';

  return (
    <AdminLayout>

      {/* Banner de boas-vindas */}
      <div className="card bg-primary text-white mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Olá, {primeiroNome} 👋</h4>
          <p className="mb-3 opacity-75">Aqui está o resumo das atividades e clientes.</p>
          <div className="row g-3">
            {STATS.map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="card bg-white bg-opacity-25 text-white border-0">
                  <div className="card-body text-center py-3">
                    <h3 className="fw-bold mb-1">{s.numero}</h3>
                    <p className="mb-0 small">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos (substituídos por barras Bootstrap) */}
      <div className="row g-4 mb-4">

        {/* Incidentes por Severidade */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header fw-semibold">Incidentes por Severidade</div>
            <div className="card-body">
              {SEVERIDADE_DADOS.map((item) => (
                <div key={item.label} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small fw-semibold">{item.label}</span>
                    <span className="small text-muted">{item.valor} incidente(s)</span>
                  </div>
                  <div className="progress" style={{ height: 12 }}>
                    <div
                      className={`progress-bar ${item.cor}`}
                      style={{ width: `${(item.valor / item.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Findings de Pentests */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header fw-semibold">Findings de Pentests por Cliente</div>
            <div className="card-body">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th className="text-center">Findings</th>
                    <th className="text-center">Resolvidos</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cliente: 'TechCorp',    findings: 12, resolvidos: 1 },
                    { cliente: 'RetailGroup', findings: 7,  resolvidos: 0 },
                    { cliente: 'FinBank',     findings: 9,  resolvidos: 0 },
                    { cliente: 'MediSafe',    findings: 15, resolvidos: 1 },
                  ].map((r) => (
                    <tr key={r.cliente}>
                      <td>{r.cliente}</td>
                      <td className="text-center"><span className="badge bg-primary">{r.findings}</span></td>
                      <td className="text-center"><span className="badge bg-danger">{r.resolvidos}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Incidentes Recentes + Clientes */}
      <div className="row g-4">

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Incidentes Recentes</span>
              <Link to="/admin/incidentes" className="btn btn-sm btn-outline-primary">Ver todos</Link>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {INCIDENTES_RECENTES.map((inc) => (
                  <li key={inc.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-0 fw-semibold small">{inc.nome}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{inc.data}</p>
                    </div>
                    <span className={`badge ${inc.bg}`}>{inc.estado}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Clientes</span>
              <Link to="/admin/clientes" className="btn btn-sm btn-outline-primary">Ver todos</Link>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {CLIENTES.map((c) => (
                  <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 36, height: 36, background: '#2563eb', fontSize: 14, flexShrink: 0 }}
                      >
                        {c.nome[0]}
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold small">{c.nome}</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{c.email}</p>
                      </div>
                    </div>
                    <span className={`badge ${c.ativo ? 'bg-success' : 'bg-secondary'}`}>
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;
