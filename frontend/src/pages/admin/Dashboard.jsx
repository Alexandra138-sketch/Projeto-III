import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ── Cores por severidade ── */
const SEVERIDADE_CORES = {
  Crítico: '#ef4444',
  Alto:    '#f97316',
  Médio:   '#3b82f6',
  Baixo:   '#22c55e',
};

/* ── Cores por estado ── */
const ESTADO_COR = {
  'Aberto':       'badge-status badge-aberto',
  'A Investigar': 'badge-status badge-investigar',
  'Resolvido':    'badge-status badge-resolvido',
  'Fechado':      'badge-status badge-resolvido',
  'Crítico':      'badge-status badge-critico',
};

/* ── Cores de avatar para clientes ── */
const AVATAR_CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

/* ── Componente sem dados ── */
function SemDados({ altura = 180 }) {
  return (
    <div style={{ height: altura, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '1.8rem' }}>📊</span>
      <span style={{ fontSize: '0.85rem' }}>Sem dados disponíveis</span>
    </div>
  );
}

function Dashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Admin';

  /* ── Estado ── */
  const [utilizadores, setUtilizadores] = useState([]);
  const [incidentes,   setIncidentes]   = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [documentos,   setDocumentos]   = useState([]);
  const [servicos,     setServicos]     = useState([]);
  const [carregando,   setCarregando]   = useState(true);

  /* ── Carregar dados reais da API ── */
  useEffect(() => {
    setCarregando(true);
    Promise.allSettled([
      api.get('/utilizadores'),
      api.get('/incidentes'),
      api.get('/clientes'),
      api.get('/documentos'),
      api.get('/servicos'),
    ]).then(([utRes, incRes, cliRes, docRes, servRes]) => {
      if (utRes.status   === 'fulfilled') setUtilizadores(Array.isArray(utRes.value.data)   ? utRes.value.data   : []);
      if (incRes.status  === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data)     ? incRes.value.data   : []);
      if (cliRes.status  === 'fulfilled') setClientes(Array.isArray(cliRes.value.data)       ? cliRes.value.data   : []);
      if (docRes.status  === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data)     ? docRes.value.data   : []);
      if (servRes.status === 'fulfilled') setServicos(Array.isArray(servRes.value.data)      ? servRes.value.data  : []);
    }).finally(() => setCarregando(false));
  }, []);

  /* ── Estatísticas calculadas ── */
  const totalUtilizadores = utilizadores.length;
  const incidentesAbertos = incidentes.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const servicosAtivos    = servicos.filter(s => s.ativo).length;
  const totalDocumentos   = documentos.length;

  /* ── Incidentes por severidade (donut) ── */
  const incidentesPorSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const chave = inc.severidade || 'Outro';
      mapa[chave] = (mapa[chave] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({
      name, value, cor: SEVERIDADE_CORES[name] || '#64748b',
    }));
  }, [incidentes]);

  /* ── Incidentes por cliente (barras) ── */
  const incidentesPorCliente = useMemo(() => {
    const mapa = {};
    // Mapear cliente_id para nome
    const nomeCliente = {};
    clientes.forEach(c => { nomeCliente[c.id] = c.nome?.split(' ')[0] || `#${c.id}`; });

    incidentes.forEach(inc => {
      const nome = nomeCliente[inc.cliente_id] || 'Outro';
      mapa[nome] = (mapa[nome] || 0) + 1;
    });
    return Object.entries(mapa)
      .map(([cliente, total]) => ({ cliente, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6); // máx 6 clientes
  }, [incidentes, clientes]);

  /* ── Últimos 4 incidentes ── */
  const incidentesRecentes = useMemo(() => {
    return [...incidentes]
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
      .slice(0, 4);
  }, [incidentes]);

  /* ── Últimos 4 clientes ── */
  const clientesRecentes = useMemo(() => {
    return [...clientes]
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
      .slice(0, 4);
  }, [clientes]);

  const stats = [
    { numero: carregando ? '…' : totalUtilizadores, label: 'Utilizadores' },
    { numero: carregando ? '…' : incidentesAbertos, label: 'Incidentes Abertos' },
    { numero: carregando ? '…' : servicosAtivos,    label: 'Serviços Ativos' },
    { numero: carregando ? '…' : totalDocumentos,   label: 'Documentos' },
  ];

  return (
    <AdminLayout>

      {/* Banner de boas-vindas + estatísticas */}
      <div className="dash-banner">
        <h4>Olá, {primeiroNome} 👋</h4>
        <p>Aqui está o resumo das atividades e clientes.</p>
        <div className="row g-3">
          {stats.map((s) => (
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

        {/* Donut: Incidentes por Severidade */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Incidentes por Severidade</h5>
            {incidentesPorSeveridade.length === 0 ? <SemDados /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={incidentesPorSeveridade} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value">
                      {incidentesPorSeveridade.map((entry) => (
                        <Cell key={entry.name} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {incidentesPorSeveridade.map((item) => (
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

        {/* Barras: Incidentes por Cliente */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5>Incidentes por Cliente</h5>
            {incidentesPorCliente.length === 0 ? <SemDados /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={incidentesPorCliente} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="cliente" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" name="Incidentes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
            {incidentesRecentes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>Sem incidentes registados</p>
            ) : (
              incidentesRecentes.map((inc) => (
                <div className="incidente-row" key={inc.id}>
                  <div>
                    <p className="incidente-nome">{inc.titulo}</p>
                    <p className="incidente-data">
                      {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}
                    </p>
                  </div>
                  <span className={ESTADO_COR[inc.estado] || 'badge-status badge-aberto'}>
                    {inc.estado || 'Aberto'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clientes recentes */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Clientes</h5>
              <Link to="/admin/clientes" className="ver-todos-link">Ver todos →</Link>
            </div>
            {clientesRecentes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>Sem clientes registados</p>
            ) : (
              clientesRecentes.map((c, idx) => (
                <div className="cliente-row" key={c.id}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="cliente-avatar" style={{ backgroundColor: AVATAR_CORES[idx % AVATAR_CORES.length] }}>
                      {c.nome?.[0]?.toUpperCase() || '?'}
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
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;
