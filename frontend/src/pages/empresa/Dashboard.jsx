// ─────────────────────────────────────────────────────────────
//  Página: empresa/Dashboard.jsx
//
//  Dashboard principal para contas de empresa (cliente).
//  Mostra:
//    - Banner de boas-vindas com dados da empresa
//    - Cartões de estatísticas (incidentes, documentos, pentests)
//    - Gráfico donut: Incidentes por Severidade
//    - Gráfico de barras: Incidentes por Estado
//    - Lista com os incidentes mais recentes
//    - Lista com os documentos mais recentes
//
//  Todos os dados vêm das rotas exclusivas da empresa:
//    GET /empresa/perfil
//    GET /empresa/incidentes
//    GET /empresa/documentos
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// ── Cores por severidade ──────────────────────────────────────
const SEVERIDADE_CORES = {
  'Crítico': '#ef4444',
  'Alto':    '#f97316',
  'Médio':   '#3b82f6',
  'Baixo':   '#22c55e',
};

// ── Badges por severidade/estado ─────────────────────────────
const SEV = {
  'Crítico': { dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

const STA = {
  'Aberto':       { bg: '#dbeafe', cor: '#2563eb' },
  'A Investigar': { bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { bg: '#f1f5f9', cor: '#64748b' },
};

// ── Altura padrão dos gráficos ────────────────────────────────
const CHART_H = 200;

// ── Componente vazio quando não há dados para o gráfico ───────
function SemDados() {
  return (
    <div style={{
      height: CHART_H,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '8px', color: '#94a3b8',
    }}>
      <span style={{ fontSize: '1.8rem' }}>📊</span>
      <span style={{ fontSize: '0.85rem' }}>Sem dados disponíveis</span>
    </div>
  );
}

function Dashboard() {
  const { utilizador } = useAuth();

  // ── Estado ──────────────────────────────────────────────────
  const [perfil,     setPerfil]     = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  // ── Carregar todos os dados ao abrir a página ──────────────
  useEffect(() => {
    setCarregando(true);

    // allSettled: se uma chamada falhar, as outras continuam a carregar
    Promise.allSettled([
      api.get('/empresa/perfil'),
      api.get('/empresa/incidentes'),
      api.get('/empresa/documentos'),
    ]).then(([perfilRes, incRes, docRes]) => {
      if (perfilRes.status === 'fulfilled') setPerfil(perfilRes.value.data);
      if (incRes.status   === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
      if (docRes.status   === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data : []);

      // Só mostrar erro se TODAS as chamadas falharem
      const todasFalharam = [perfilRes, incRes, docRes].every(r => r.status === 'rejected');
      if (todasFalharam) setErro('Não foi possível carregar os dados. Tenta novamente.');
    }).finally(() => setCarregando(false));
  }, []);

  // ── Estatísticas calculadas ────────────────────────────────
  const totalIncidentes   = incidentes.length;
  const incidentesAbertos = incidentes.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const totalDocumentos   = documentos.length;
  const totalPentests     = documentos.filter(d => d.tipo === 'Pentest').length;

  // ── Dados para gráfico donut: Incidentes por Severidade ───
  const dadosSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const sev = inc.severidade || 'Sem classificação';
      mapa[sev] = (mapa[sev] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [incidentes]);

  // ── Dados para gráfico de barras: Incidentes por Estado ───
  const dadosEstado = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const est = inc.estado || 'Desconhecido';
      mapa[est] = (mapa[est] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [incidentes]);

  // Mostrar apenas os 4 mais recentes
  const incidentesRecentes = incidentes.slice(0, 4);
  const documentosRecentes = documentos.slice(0, 4);

  return (
    <AdminLayout>

      {/* ── Banner de boas-vindas ── */}
      <div className="dash-banner">
        <h4>Bem-vindo, {utilizador?.nome?.split(' ')[0] || perfil?.nome || 'Empresa'}!</h4>
        <p>
          {perfil
            ? `${perfil.nome} · Gestor: ${perfil.gestor?.nome || '—'}`
            : 'A carregar dados da empresa…'}
        </p>
        <div className="row g-3 mt-1">
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalIncidentes}</div>
              <div className="stat-label">Total Incidentes</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : incidentesAbertos}</div>
              <div className="stat-label">Em Aberto</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalDocumentos}</div>
              <div className="stat-label">Documentos</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalPentests}</div>
              <div className="stat-label">Pentests</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Erro geral ── */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* ── Cards de resumo — mesmo padrão que admin/Incidentes.jsx ── */}
      {!carregando && (
        <div className="resumo-kpi-grid mb-4">
          <div className="resumo-kpi-card resumo-kpi-azul">
            <div className="resumo-kpi-header">
              <p className="resumo-kpi-titulo">Total Documentos</p>
            </div>
            <p className="resumo-kpi-valor resumo-kpi-val-azul">{totalDocumentos}</p>
            <p className="resumo-kpi-sub">{totalDocumentos} ativos</p>
          </div>
          <div className="resumo-kpi-card resumo-kpi-roxo">
            <div className="resumo-kpi-header">
              <p className="resumo-kpi-titulo">Pentests</p>
            </div>
            <p className="resumo-kpi-valor resumo-kpi-val-roxo">{totalPentests}</p>
            <p className="resumo-kpi-sub">relatórios</p>
          </div>
          <div className="resumo-kpi-card resumo-kpi-laranja">
            <div className="resumo-kpi-header">
              <p className="resumo-kpi-titulo">Incidentes totais</p>
            </div>
            <p className="resumo-kpi-valor resumo-kpi-val-laranja">{totalIncidentes}</p>
            <p className="resumo-kpi-sub">{incidentesAbertos} abertos</p>
          </div>
          <div className="resumo-kpi-card resumo-kpi-verde">
            <div className="resumo-kpi-header">
              <p className="resumo-kpi-titulo">Incidentes Abertos</p>
            </div>
            <p className="resumo-kpi-valor resumo-kpi-val-verde">{incidentesAbertos}</p>
            <p className="resumo-kpi-sub">em tratamento</p>
          </div>
        </div>
      )}

      {/* ── Gráficos ── */}
      <div className="row g-4 mb-4">

        {/* Donut: Incidentes por Severidade */}
        <div className="col-12 col-md-6">
          <div className="dash-card h-100">
            <h5>Incidentes por Severidade</h5>
            {carregando ? (
              <SemDados />
            ) : dadosSeveridade.length === 0 ? (
              <SemDados />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_H}>
                <PieChart>
                  <Pie
                    data={dadosSeveridade}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dadosSeveridade.map((entry, i) => (
                      <Cell key={i} fill={SEVERIDADE_CORES[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Legenda manual */}
            {!carregando && dadosSeveridade.length > 0 && (
              <div className="pie-legend">
                {dadosSeveridade.map((entry, i) => (
                  <div className="pie-legend-item" key={i}>
                    <div className="pie-dot" style={{ background: SEVERIDADE_CORES[entry.name] || '#94a3b8' }} />
                    <span>{entry.name}: <strong>{entry.value}</strong></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barras: Incidentes por Estado */}
        <div className="col-12 col-md-6">
          <div className="dash-card h-100">
            <h5>Incidentes por Estado</h5>
            {carregando ? (
              <SemDados />
            ) : dadosEstado.length === 0 ? (
              <SemDados />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_H}>
                <BarChart data={dadosEstado} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Incidentes" radius={[4, 4, 0, 0]}>
                    {dadosEstado.map((entry, i) => {
                      const cores = ['#3b82f6', '#f59e0b', '#22c55e', '#94a3b8'];
                      return <Cell key={i} fill={cores[i % cores.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Incidentes recentes ── */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0" style={{ color: '#1e293b', fontWeight: 700 }}>Incidentes Recentes</h5>
          <Link to="/empresa/ambiente" className="ver-todos-link">Ver todos →</Link>
        </div>

        {carregando ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            A carregar…
          </div>
        ) : incidentesRecentes.length === 0 ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Sem incidentes registados.
          </div>
        ) : incidentesRecentes.map(inc => {
          const sev = SEV[inc.severidade] || SEV['Médio'];
          const sta = STA[inc.estado]     || STA['Aberto'];
          return (
            <div key={inc.id} className="dash-card incidente-card">
              <div className="d-flex align-items-start gap-3">
                <div className="incidente-dot" style={{ backgroundColor: sev.dot, marginTop: 4 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <p className="incidente-nome">{inc.titulo}</p>
                    <span className="badge-pill" style={{ background: sev.bg, color: sev.cor }}>{inc.severidade}</span>
                    <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{inc.estado}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-3">
                    {inc.responsavel?.nome && <span className="incidente-data">Responsável: {inc.responsavel.nome}</span>}
                    {inc.created_at && <span className="incidente-data">{new Date(inc.created_at).toLocaleDateString('pt-PT')}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Documentos recentes ── */}
      <div className="dash-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0" style={{ color: '#1e293b', fontWeight: 700 }}>Documentos Recentes</h5>
          <Link to="/empresa/documentos" className="ver-todos-link">Ver todos →</Link>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar…</p>
        ) : documentosRecentes.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Sem documentos disponíveis.</p>
        ) : documentosRecentes.map(doc => (
          <div
            key={doc.id}
            className="d-flex align-items-center justify-content-between"
            style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}
          >
            <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
              <span className="incidente-nome" style={{ fontSize: '0.88rem' }}>{doc.titulo}</span>
              <span className="badge-pill" style={{ background: '#dbeafe', color: '#2563eb' }}>{doc.tipo || '—'}</span>
            </div>
            <div className="d-flex gap-3" style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>
              <span>{doc.tamanho || '—'}</span>
              <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '—'}</span>
            </div>
          </div>
        ))}
      </div>

    </AdminLayout>
  );
}

export default Dashboard;
