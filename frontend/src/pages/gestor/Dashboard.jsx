import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  Users, FileText, AlertTriangle, TrendingUp, CheckCircle, XCircle,
} from 'lucide-react';

/* ── Cor por ID de cliente ── */
const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) { return CORES[(parseInt(id, 10) - 1) % CORES.length]; }

/* ── Badge de estado de incidente ── */
const STA_CFG = {
  'Aberto':       { bg: '#fee2e2', cor: '#dc2626' },
  'A Investigar': { bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { bg: '#f1f5f9', cor: '#64748b' },
};

function GestorDashboard() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Gestor';

  const [clientes,   setClientes]   = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  /* ── Buscar dados da API (Axios) ── */
  useEffect(() => {
    Promise.all([
      api.get('/clientes'),
      api.get('/incidentes'),
      api.get('/documentos'),
    ])
      .then(([c, i, d]) => {
        setClientes(c.data);
        setIncidentes(i.data);
        setDocumentos(d.data);
      })
      .catch((err) => console.error('Erro ao carregar dashboard:', err))
      .finally(() => setCarregando(false));
  }, []);

  /* ── Cálculos de KPIs ── */
  const incAbertos  = incidentes.filter((i) => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const incCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado' && i.estado !== 'Resolvido').length;
  const docsAtivos  = documentos.filter((d) => d.estado === 'Ativo').length;

  const stats = [
    { numero: clientes.length,   label: 'Clientes',           cor: '#2563eb', bg: '#dbeafe' },
    { numero: incAbertos,        label: 'Incidentes Abertos',  cor: '#dc2626', bg: '#fee2e2' },
    { numero: incCriticos,       label: 'Críticos Ativos',     cor: '#c2410c', bg: '#ffedd5' },
    { numero: docsAtivos,        label: 'Documentos Ativos',   cor: '#16a34a', bg: '#dcfce7' },
  ];

  /* ── 5 incidentes mais recentes ── */
  const incRecentes = [...incidentes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  /* ── 5 documentos mais recentes ── */
  const docsRecentes = [...documentos]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <AdminLayout>

      {/* Banner de boas-vindas */}
      <div className="dash-banner">
        <h4>Olá, {primeiroNome} 👋</h4>
        <p>Aqui está o resumo das atividades dos seus clientes.</p>
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

      {/* Linha principal: Incidentes + Clientes */}
      <div className="row g-4 mb-4">

        {/* Incidentes recentes */}
        <div className="col-12 col-lg-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ fontSize: '1rem', fontWeight: 600 }}>
                <AlertTriangle size={16} color="#f97316" style={{ marginRight: 8 }} />
                Incidentes Recentes
              </h5>
              <Link to="/gestor/incidentes" className="ver-todos-link">Ver todos →</Link>
            </div>

            {carregando ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>A carregar…</p>
            ) : incRecentes.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                Sem incidentes registados.
              </p>
            ) : incRecentes.map((inc) => {
              const sta = STA_CFG[inc.estado] || STA_CFG['Aberto'];
              const dotCor = {
                'Crítico': '#ef4444', 'Alto': '#f97316',
                'Médio': '#f59e0b',   'Baixo': '#22c55e',
              }[inc.severidade] || '#94a3b8';
              return (
                <div className="incidente-row" key={inc.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotCor, marginTop: 6, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p className="incidente-nome" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.titulo}</p>
                      <p className="incidente-data">
                        {inc.cliente?.nome || '—'} · {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : ''}
                      </p>
                    </div>
                  </div>
                  <span className="badge-pill" style={{ background: sta.bg, color: sta.cor, flexShrink: 0 }}>
                    {inc.estado}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clientes */}
        <div className="col-12 col-lg-6">
          <div className="dash-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ fontSize: '1rem', fontWeight: 600 }}>
                <Users size={16} color="#2563eb" style={{ marginRight: 8 }} />
                Os Meus Clientes
              </h5>
              <Link to="/gestor/clientes" className="ver-todos-link">Ver todos →</Link>
            </div>

            {carregando ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>A carregar…</p>
            ) : clientes.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                Sem clientes atribuídos.
              </p>
            ) : clientes.slice(0, 5).map((c) => {
              const ativo = c.estado === 'Ativo';
              return (
                <div className="cliente-row" key={c.id}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="cliente-avatar" style={{ backgroundColor: getCor(c.id) }}>
                      {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="cliente-nome">{c.nome}</p>
                      <p className="cliente-email">{c.email}</p>
                    </div>
                  </div>
                  <span className={ativo ? 'badge-ativo' : 'badge-inativo'}>
                    {ativo ? '● Ativo' : '○ Inativo'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Documentos recentes */}
      <div className="dash-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0" style={{ fontSize: '1rem', fontWeight: 600 }}>
            <FileText size={16} color="#8b5cf6" style={{ marginRight: 8 }} />
            Documentos Recentes
          </h5>
          <Link to="/gestor/documentos" className="ver-todos-link">Ver todos →</Link>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>A carregar…</p>
        ) : docsRecentes.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            Sem documentos.
          </p>
        ) : (
          <div className="row g-3">
            {docsRecentes.map((doc) => {
              const estCfg = {
                'Ativo':      { bg: '#dcfce7', cor: '#16a34a' },
                'Em Revisão': { bg: '#fef9c3', cor: '#ca8a04' },
                'Expirado':   { bg: '#fee2e2', cor: '#dc2626' },
              }[doc.estado] || { bg: '#f1f5f9', cor: '#64748b' };
              return (
                <div className="col-12 col-sm-6 col-xl-3" key={doc.id}>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.85rem', height: '100%' }}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="badge-pill" style={{ background: estCfg.bg, color: estCfg.cor, fontSize: '0.68rem' }}>
                        {doc.estado}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{doc.tipo}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: '0.4rem 0 0.2rem', lineHeight: 1.3 }}>
                      {doc.titulo}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                      {doc.cliente?.nome || '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo de incidentes por severidade */}
      {!carregando && incidentes.length > 0 && (
        <div className="dash-card mt-0">
          <h5 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
            <TrendingUp size={16} color="#64748b" style={{ marginRight: 8 }} />
            Distribuição de Incidentes por Severidade
          </h5>
          <div className="row g-3">
            {[
              { label: 'Crítico',     cor: '#ef4444', bg: '#fee2e2' },
              { label: 'Alto',        cor: '#c2410c', bg: '#ffedd5' },
              { label: 'Médio',       cor: '#ca8a04', bg: '#fef9c3' },
              { label: 'Baixo',       cor: '#16a34a', bg: '#dcfce7' },
            ].map(({ label, cor, bg }) => {
              const count = incidentes.filter((i) => i.severidade === label).length;
              return (
                <div className="col-6 col-md-3" key={label}>
                  <div style={{ background: bg, borderRadius: 10, padding: '0.9rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: cor, margin: 0 }}>{count}</p>
                    <p style={{ fontSize: '0.75rem', color: cor, margin: 0, fontWeight: 500 }}>{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default GestorDashboard;
