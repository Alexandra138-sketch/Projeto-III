// ─────────────────────────────────────────────────────────────
//  Componente: AdminTopbar.jsx
//
//  Barra superior partilhada por todos os perfis (admin, gestor, empresa).
//  Mostra o título da página atual, área do perfil, e botões de ação.
//
//  Funcionalidades:
//    - Navegação para a página inicial
//    - Modal do perfil do utilizador
//    - Sino de notificações com badge e dropdown de incidentes abertos
//    - Botão de logout
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Bell, LogOut, User } from 'lucide-react';
import ModalPerfil from './ModalPerfil';
import api from '../api/axios';
import './layout.css';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/analises': 'Análises & Gráficos',
  '/admin/utilizadores': 'Utilizadores',
  '/admin/clientes': 'Clientes',
  '/admin/documentos': 'Documentos',
  '/admin/incidentes': 'Incidentes',
  '/admin/logs': 'Logs de Atividade',
  '/admin/conteudo': 'Conteúdo do Site',
  '/gestor': 'Dashboard',
  '/gestor/clientes': 'Clientes',
  '/gestor/documentos': 'Documentos',
  '/gestor/incidentes': 'Incidentes',
  '/empresa': 'Dashboard',
  '/empresa/documentos': 'Os Meus Documentos',
  '/empresa/incidentes': 'Incidentes',
};

const AREA_LABELS = {
  admin:  'Área Administrador',
  gestor: 'Área Gestor',
  empresa: 'Área Empresa',
};

// Cores de severidade para o badge
const SEV_COR = {
  'Crítico': '#dc2626',
  'Alto':    '#ea580c',
  'Médio':   '#ca8a04',
  'Baixo':   '#16a34a',
};

function AdminTopbar() {
  const { utilizador, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  // ── Estado do modal de perfil ──
  const [modalPerfil, setModalPerfil] = useState(false);

  // ── Estado das notificações ──
  const [notifAberto,  setNotifAberto]  = useState(false);
  const [notifs,       setNotifs]       = useState([]);  // incidentes abertos

  // Ref para fechar o dropdown ao clicar fora
  const bellRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Painel';
  const areaLabel = `CyberBoxSecur — ${AREA_LABELS[utilizador?.perfil] || 'Painel'}`;

  // ── Carregar incidentes abertos quando o componente monta ──
  useEffect(() => {
    if (!utilizador) return;

    // Endpoint diferente consoante o perfil
    const endpoint = utilizador.perfil === 'empresa'
      ? '/empresa/incidentes'
      : '/incidentes';

    api.get(endpoint)
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : [];
        // Filtrar apenas os incidentes com estado 'Aberto'
        const abertos = lista.filter(i => i.estado === 'Aberto');
        setNotifs(abertos);
      })
      .catch(() => {
        // Falha silenciosa — não mostrar erro na topbar
        setNotifs([]);
      });
  }, [utilizador]);

  // ── Fechar dropdown ao clicar fora ──
  useEffect(() => {
    const handleClickFora = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setNotifAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
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
        {/* Página Inicial */}
        <button className="topbar-btn" title="Página Inicial" onClick={() => navigate('/')}>
          <Home size={17} />
        </button>

        {/* Perfil */}
        <button className="topbar-btn" title="O Meu Perfil" onClick={() => setModalPerfil(true)}>
          <User size={17} />
        </button>

        {/* ── Sino de notificações ── */}
        <div className="topbar-bell" ref={bellRef}>
          <button
            className="topbar-btn"
            title="Notificações"
            onClick={() => setNotifAberto(prev => !prev)}
          >
            <Bell size={17} />
          </button>

          {/* Badge com contagem (só aparece se houver incidentes abertos) */}
          {notifs.length > 0 && (
            <span className="notif-badge">{notifs.length > 9 ? '9+' : notifs.length}</span>
          )}

          {/* Dropdown de notificações */}
          {notifAberto && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                Incidentes Abertos ({notifs.length})
              </div>

              {notifs.length === 0 ? (
                <div className="notif-vazio">Sem incidentes abertos.</div>
              ) : (
                /* Mostrar máx. 6 notificações para não ocupar demasiado espaço */
                notifs.slice(0, 6).map(inc => (
                  <div className="notif-item" key={inc.id}>
                    <span className="notif-item-titulo">{inc.titulo}</span>
                    <span className="notif-item-sub">
                      {/* Bolinha colorida com a severidade */}
                      <span style={{
                        display: 'inline-block',
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: SEV_COR[inc.severidade] || '#94a3b8',
                        marginRight: 5,
                        verticalAlign: 'middle',
                      }} />
                      {inc.severidade || 'Sem severidade'}
                      {inc.cliente?.nome && ` · ${inc.cliente.nome}`}
                    </span>
                  </div>
                ))
              )}

              {/* Rodapé com link para a página de incidentes */}
              {notifs.length > 0 && (
                <div
                  style={{
                    padding: '10px 16px',
                    textAlign: 'center',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.8rem',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setNotifAberto(false);
                    // Navegar para a página de incidentes do perfil correto
                    const rota = utilizador?.perfil === 'empresa'
                      ? '/empresa/incidentes'
                      : utilizador?.perfil === 'gestor'
                        ? '/gestor/incidentes'
                        : '/admin/incidentes';
                    navigate(rota);
                  }}
                >
                  Ver todos os incidentes →
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="topbar-btn logout" title="Sair" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>

      {modalPerfil && <ModalPerfil onClose={() => setModalPerfil(false)} />}
    </header>
  );
}

export default AdminTopbar;
