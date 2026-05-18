import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ── Dados de demonstração ── */

const STATS = [
  { numero: 12, label: 'Utilizadores Ativos' },
  { numero: 4,  label: 'Incidentes Abertos'  },
  { numero: 3,  label: 'Pentests Ativos'     },
  { numero: 27, label: 'Documentos'          },
];

const INCIDENTES_SEVERIDADE = [
  { name: 'Crítico', value: 2, cor: '#ef4444' },
  { name: 'Alto',    value: 2, cor: '#f97316' },
  { name: 'Médio',   value: 1, cor: '#3b82f6' },
  { name: 'Baixo',   value: 1, cor: '#22c55e' },
];

const PENTESTS_BAR = [
  { cliente: 'TechCorp',    findings: 12, resolvidos: 1 },
  { cliente: 'RetailGroup', findings: 7,  resolvidos: 0 },
  { cliente: 'FinBank',     findings: 9,  resolvidos: 0 },
  { cliente: 'MediSafe',    findings: 15, resolvidos: 1 },
];

const INCIDENTES_RECENTES = [
  { id: 1, nome: 'Ransomware - Servidores de Ficheiros', data: '2025-02-10', estado: 'resolvido'  },
  { id: 2, nome: 'Phishing Campaign - Executivos',      data: '2025-03-10', estado: 'investigar' },
  { id: 3, nome: 'SQL Injection - Portal Cliente',      data: '2025-04-01', estado: 'critico'    },
  { id: 4, nome: 'Acesso Não Autorizado - VPN',         data: '2025-04-15', estado: 'aberto'     },
];

const CLIENTES = [
  { id: 1, nome: 'Tech Corp Portugal', email: 'seguranca@techcorp.pt', cor: '#3b82f6', ativo: true  },
  { id: 2, nome: 'Retail Group SA',    email: 'it@retailgroup.pt',     cor: '#8b5cf6', ativo: true  },
  { id: 3, nome: 'FinBank Portugal',   email: 'ciso@finbank.pt',       cor: '#10b981', ativo: true  },
  { id: 4, nome: 'MediSafe Clinic',    email: 'admin@medisafe.pt',     cor: '#f59e0b', ativo: false },
];

const BADGE_CLASS = {
  resolvido:  'badge-status badge-resolvido',
  investigar: 'badge-status badge-investigar',
  critico:    'badge-status badge-critico',
  aberto:     'badge-status badge-aberto',
};

const BADGE_LABEL = {
  resolvido:  'Resolvido',
  investigar: 'A Investigar',
  critico:    'Crítico',
  aberto:     'Aberto',
};

/* ── Componente ── */

function Dashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Admin';

  return (
    <AdminLayout>

      {/* Banner de boas-vindas + estatísticas */}
      <div className="dash-banner">
        <h4>Olá, {primeiroNome} 👋</h4>
        <p>Aqui está o resumo das atividades e clientes.</p>
        <div className="row g-3">
          {STATS.map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="stat-card">
                <div className="stat-number">{s.numero}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4 mb-4">

        {/* Pie chart */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Incidentes por Severidade</h5>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={INCIDENTES_SEVERIDADE} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                  {INCIDENTES_SEVERIDADE.map((entry) => (
                    <Cell key={entry.name} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {INCIDENTES_SEVERIDADE.map((item) => (
                <div className="pie-legend-item" key={item.name}>
                  <span className="pie-dot" style={{ backgroundColor: item.cor }}></span>
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Findings de Pentests por Cliente</h5>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={PENTESTS_BAR} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="cliente" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="findings"   name="Findings"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvidos" name="Resolvidos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Incidentes Recentes + Clientes */}
      <div className="row g-4">

        {/* Incidentes recentes */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Incidentes Recentes</h5>
              <Link to="/admin/incidentes" className="ver-todos-link">Ver todos →</Link>
            </div>
            {INCIDENTES_RECENTES.map((inc) => (
              <div className="incidente-row" key={inc.id}>
                <div>
                  <p className="incidente-nome">{inc.nome}</p>
                  <p className="incidente-data">{inc.data}</p>
                </div>
                <span className={BADGE_CLASS[inc.estado]}>{BADGE_LABEL[inc.estado]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Clientes</h5>
              <Link to="/admin/clientes" className="ver-todos-link">Ver todos →</Link>
            </div>
            {CLIENTES.map((c) => (
              <div className="cliente-row" key={c.id}>
                <div className="d-flex align-items-center gap-3">
                  <div className="cliente-avatar" style={{ backgroundColor: c.cor }}>
                    {c.nome[0]}
                  </div>
                  <div>
                    <p className="cliente-nome">{c.nome}</p>
                    <p className="cliente-email">{c.email}</p>
                  </div>
                </div>
                <span className={c.ativo ? 'badge-ativo' : 'badge-inativo'}>
                  {c.ativo ? '● Ativo' : '○ Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;
