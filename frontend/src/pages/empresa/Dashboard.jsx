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

// Cores dos badges de severidade
const BADGE_SEVERIDADE = {
  Crítico: 'badge bg-danger',
  Alto:    'badge bg-warning text-dark',
  Médio:   'badge bg-primary',
  Baixo:   'badge bg-success',
};

// Cores dos badges de estado do incidente
const BADGE_ESTADO = {
  Aberto:          'badge bg-danger',
  'A Investigar':  'badge bg-warning text-dark',
  Resolvido:       'badge bg-success',
  Fechado:         'badge bg-secondary',
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
      <div className="dash-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Incidentes Recentes</h5>
          <Link to="/empresa/incidentes" className="btn btn-sm btn-outline-primary">
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar…</p>
        ) : incidentesRecentes.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Sem incidentes registados.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Severidade</th>
                  <th>Estado</th>
                  <th>Responsável</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {incidentesRecentes.map(inc => (
                  <tr key={inc.id}>
                    <td>{inc.titulo}</td>
                    <td>
                      <span className={BADGE_SEVERIDADE[inc.severidade] || 'badge bg-secondary'}>
                        {inc.severidade}
                      </span>
                    </td>
                    <td>
                      <span className={BADGE_ESTADO[inc.estado] || 'badge bg-secondary'}>
                        {inc.estado}
                      </span>
                    </td>
                    <td>{inc.responsavel?.nome || '—'}</td>
                    <td>{inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Documentos recentes ── */}
      <div className="dash-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Documentos Recentes</h5>
          <Link to="/empresa/documentos" className="btn btn-sm btn-outline-primary">
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar…</p>
        ) : documentosRecentes.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Sem documentos disponíveis.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {documentosRecentes.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.titulo}</td>
                    <td>
                      <span className="badge bg-info text-dark">{doc.tipo || '—'}</span>
                    </td>
                    <td>{doc.tamanho || '—'}</td>
                    <td>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}

export default Dashboard;
