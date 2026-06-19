import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) { return CORES[(parseInt(id, 10) - 1) % CORES.length]; }

const SEV_CORES = {
  Crítico: '#ef4444',
  Alto:    '#f97316',
  Médio:   '#3b82f6',
  Baixo:   '#22c55e',
};

const EST_CFG = {
  'Aberto':       { bg: '#fee2e2', cor: '#dc2626' },
  'A Investigar': { bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { bg: '#f1f5f9', cor: '#64748b' },
};

function Dashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Admin';

  const [clientes,    setClientes]    = useState([]);
  const [incidentes,  setIncidentes]  = useState([]);
  const [documentos,  setDocumentos]  = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [carregando,  setCarregando]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/clientes'),
      api.get('/incidentes'),
      api.get('/documentos'),
      api.get('/utilizadores'),
    ]).then(([c, i, d, u]) => {
      if (c.status === 'fulfilled') setClientes(Array.isArray(c.value.data) ? c.value.data : []);
      if (i.status === 'fulfilled') setIncidentes(Array.isArray(i.value.data) ? i.value.data : []);
      if (d.status === 'fulfilled') setDocumentos(Array.isArray(d.value.data) ? d.value.data : []);
      if (u.status === 'fulfilled') setUtilizadores(Array.isArray(u.value.data) ? u.value.data : []);
    }).finally(() => setCarregando(false));
  }, []);

  const incAbertos = incidentes.filter((i) => i.estado === 'Aberto' || i.estado === 'A Investigar').length;

  const stats = [
    { numero: utilizadores.length, label: 'Utilizadores' },
    { numero: incAbertos,          label: 'Incidentes Abertos' },
    { numero: clientes.length,     label: 'Clientes' },
    { numero: documentos.length,   label: 'Documentos' },
  ];

  // Pie: incidentes por severidade
  const sevMap = {};
  incidentes.forEach((inc) => {
    const k = inc.severidade || 'Outro';
    sevMap[k] = (sevMap[k] || 0) + 1;
  });
  const incPorSev = Object.entries(sevMap).map(([name, value]) => ({
    name, value, cor: SEV_CORES[name] || '#64748b',
  }));

  // Bar: incidentes por cliente (top 5)
  const cliMap = {};
  incidentes.forEach((inc) => {
    const nome = inc.cliente?.nome || `Cliente ${inc.cliente_id}`;
    cliMap[nome] = (cliMap[nome] || 0) + 1;
  });
  const incPorCli = Object.entries(cliMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cliente, total]) => ({ cliente, total }));

  const incRecentes = [...incidentes].slice(0, 4);

  return (
    <AdminLayout>

      <div className="dash-banner">
        <h4>Olá, {primeiroNome} 👋</h4>
        <p>Aqui está o resumo das atividades e clientes.</p>
        <div className="row g-3">
          {stats.map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="stat-card">
                <div className="stat-number">{carregando ? '…' : s.numero}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-4">

        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Incidentes por Severidade</h5>
            {incPorSev.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={incPorSev} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                      {incPorSev.map((entry) => (
                        <Cell key={entry.name} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {incPorSev.map((item) => (
                    <div className="pie-legend-item" key={item.name}>
                      <span className="pie-dot" style={{ backgroundColor: item.cor }}></span>
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Incidentes por Cliente</h5>
            {incPorCli.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={incPorCli} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="cliente" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Incidentes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      <div className="row g-4">

        <div className="col-12 col-md-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Incidentes Recentes</h5>
              <Link to="/admin/incidentes" className="ver-todos-link">Ver todos →</Link>
            </div>
            {incRecentes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>Sem incidentes</p>
            ) : incRecentes.map((inc) => {
              const cfg = EST_CFG[inc.estado] || { bg: '#f1f5f9', cor: '#64748b' };
              return (
                <div className="incidente-row" key={inc.id}>
                  <div>
                    <p className="incidente-nome">{inc.titulo}</p>
                    <p className="incidente-data">
                      {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}
                    </p>
                  </div>
                  <span style={{ background: cfg.bg, color: cfg.cor, fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                    {inc.estado}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Clientes</h5>
              <Link to="/admin/clientes" className="ver-todos-link">Ver todos →</Link>
            </div>
            {clientes.slice(0, 4).map((c) => (
              <div className="cliente-row" key={c.id}>
                <div className="d-flex align-items-center gap-3">
                  <div className="cliente-avatar" style={{ backgroundColor: getCor(c.id) }}>
                    {c.nome?.[0] || '?'}
                  </div>
                  <div>
                    <p className="cliente-nome">{c.nome}</p>
                    <p className="cliente-email">{c.email}</p>
                  </div>
                </div>
                <span className={c.estado === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}>
                  {c.estado === 'Ativo' ? '● Ativo' : '○ Inativo'}
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
