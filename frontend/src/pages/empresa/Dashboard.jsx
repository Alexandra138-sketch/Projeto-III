// ─────────────────────────────────────────────────────────────
//  Página: empresa/Dashboard.jsx
//
//  Dashboard principal para contas de empresa (cliente).
//  Mostra:
//    - Banner de boas-vindas com dados da empresa
//    - Cartões de estatísticas (incidentes, documentos)
//    - Tabela com os incidentes mais recentes
//    - Tabela com os documentos mais recentes
//
//  Os dados vêm das rotas exclusivas da empresa:
//    GET /empresa/perfil
//    GET /empresa/incidentes
//    GET /empresa/documentos
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// Cores por severidade/estado do incidente
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

function Dashboard() {
  const { utilizador } = useAuth();

  const [perfil,     setPerfil]     = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  // ── Carregar todos os dados ao abrir a página ──
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

  // Calcular estatísticas
  const totalIncidentes   = incidentes.length;
  const incidentesAbertos = incidentes.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const totalDocumentos   = documentos.length;

  // Mostrar apenas os 5 mais recentes em cada tabela
  const incidentesRecentes = incidentes.slice(0, 5);
  const documentosRecentes = documentos.slice(0, 5);

  return (
    <AdminLayout>

      {/* ── Banner de boas-vindas ── */}
      <div className="dash-banner">
        <h4>Bem-vindo, {utilizador?.nome || perfil?.nome || 'Empresa'}!</h4>
        <p>
          {perfil
            ? `${perfil.nome} · Gestor: ${perfil.gestor?.nome || '—'}`
            : 'A carregar dados da empresa…'}
        </p>
        <div className="row g-3">
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalIncidentes}</div>
              <div className="stat-label">Total Incidentes</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : incidentesAbertos}</div>
              <div className="stat-label">Em Aberto</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalDocumentos}</div>
              <div className="stat-label">Documentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Erro geral ── */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* ── Incidentes recentes ── */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Incidentes Recentes</h5>
          <Link to="/empresa/incidentes" className="ver-todos-link">
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>A carregar…</div>
        ) : incidentesRecentes.length === 0 ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Sem incidentes registados.</div>
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
          <h5 className="mb-0">Documentos Recentes</h5>
          <Link to="/empresa/documentos" className="ver-todos-link">
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar…</p>
        ) : documentosRecentes.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Sem documentos disponíveis.</p>
        ) : documentosRecentes.map(doc => (
          <div key={doc.id} className="d-flex align-items-center justify-content-between" style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
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
