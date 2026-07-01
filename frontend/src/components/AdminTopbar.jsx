// ─────────────────────────────────────────────────────────────
//  Componente: AdminTopbar
//
//  Barra de topo partilhada por admin, gestor e empresa.
//  Mostra: título da página, área do utilizador, atalhos de
//  navegação, painel de notificações (incidentes em aberto)
//  e botão de logout.
// ─────────────────────────────────────────────────────────────

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Bell, LogOut, X, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import './layout.css';

const PAGE_TITLES = {
  '/admin':              'Dashboard',
  '/admin/analises':     'Análises & Gráficos',
  '/admin/utilizadores': 'Utilizadores',
  '/admin/clientes':     'Clientes',
  '/admin/documentos':   'Documentos',
  '/admin/incidentes':   'Incidentes',
  '/admin/logs':         'Logs de Atividade',
  '/admin/conteudo':     'Conteúdo do Site',
  '/gestor':             'Dashboard',
  '/gestor/clientes':    'Clientes',
  '/gestor/documentos':  'Documentos',
  '/gestor/incidentes':  'Incidentes',
  '/empresa':            'Dashboard',
  '/empresa/documentos': 'Os Meus Documentos',
  '/empresa/incidentes': 'Incidentes',
};

const AREA_LABELS = {
  admin:   'Área Administrador',
  gestor:  'Área Gestor',
  empresa: 'Área Empresa',
};

// Cores por severidade de incidente
const SEV_CORES = {
  'Crítico': { dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

function AdminTopbar() {
  const { utilizador, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mostrarNotifs, setMostrarNotifs] = useState(false);
  const [notificacoes,  setNotificacoes]  = useState([]);
  const bellRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Painel';
  const areaLabel = `CyberBoxSecur — ${AREA_LABELS[utilizador?.perfil] || 'Painel'}`;

  // ── Buscar incidentes em aberto para mostrar como notificações ──
  useEffect(() => {
    if (!utilizador) return;

    // Empresa usa endpoint próprio; admin/gestor usam o geral
    const endpoint = utilizador.perfil === 'empresa'
      ? '/empresa/incidentes'
      : '/incidentes';

    api.get(endpoint)
      .then(({ data }) => {
        // Apenas incidentes que ainda estão por resolver
        const abertos = Array.isArray(data)
          ? data.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar')
          : [];
        setNotificacoes(abertos.slice(0, 15)); // máximo 15
      })
      .catch(() => setNotificacoes([]));
  }, [utilizador]);

  // ── Fechar dropdown ao clicar fora ──
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setMostrarNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-topbar">
      <div>
        <p className="topbar-title">{pageTitle}</p>
        <p className="topbar-subtitle">{areaLabel}</p>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Botão página inicial */}
        <button className="topbar-btn" title="Página Inicial" onClick={() => navigate('/')}>
          <Home size={17} />
        </button>

        {/* ── Sino de notificações ── */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button
            className="topbar-btn"
            title="Notificações"
            onClick={() => setMostrarNotifs(v => !v)}
          >
            <Bell size={17} />
          </button>

          {/* Badge com o número de incidentes em aberto */}
          {notificacoes.length > 0 && (
            <span className="notif-badge">{notificacoes.length}</span>
          )}

          {/* Dropdown de notificações */}
          {mostrarNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 340, background: '#fff', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 1000, overflow: 'hidden',
            }}>

              {/* Cabeçalho do dropdown */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.9rem 1.1rem', borderBottom: '1px solid #f1f5f9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <AlertTriangle size={15} color="#f97316" />
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                    Notificações
                  </p>
                </div>
                <button
                  onClick={() => setMostrarNotifs(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Lista de notificações */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notificacoes.length === 0 ? (
                  <p style={{
                    textAlign: 'center', color: '#94a3b8',
                    padding: '2rem 1rem', margin: 0, fontSize: '0.875rem',
                  }}>
                    Sem incidentes em aberto.
                  </p>
                ) : (
                  notificacoes.map((inc, i) => {
                    const sev = SEV_CORES[inc.severidade] || SEV_CORES['Médio'];
                    return (
                      <div
                        key={inc.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.85rem 1.1rem',
                          borderBottom: i < notificacoes.length - 1 ? '1px solid #f8fafc' : 'none',
                          cursor: 'default',
                        }}
                      >
                        {/* Ponto colorido por severidade */}
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: sev.dot, marginTop: 5, flexShrink: 0,
                        }} />

                        {/* Título + badges */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontSize: '0.83rem', fontWeight: 600, color: '#1e293b',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {inc.titulo}
                          </p>
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 600,
                              padding: '1px 7px', borderRadius: 99,
                              background: sev.bg, color: sev.cor,
                            }}>
                              {inc.severidade}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {inc.estado}
                            </span>
                            {/* Nome do cliente (admin/gestor) */}
                            {inc.cliente?.nome && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                · {inc.cliente.nome}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rodapé */}
              {notificacoes.length > 0 && (
                <div style={{
                  padding: '0.65rem 1.1rem', borderTop: '1px solid #f1f5f9',
                  textAlign: 'center',
                }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    {notificacoes.length} incidente{notificacoes.length !== 1 ? 's' : ''} em aberto
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão logout */}
        <button className="topbar-btn logout" title="Sair" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
