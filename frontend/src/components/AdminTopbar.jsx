import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBell, FiLogOut } from 'react-icons/fi';
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
  admin: 'Área Administrador',
  gestor: 'Área Gestor',
  empresa: 'Área Empresa',
};

function AdminTopbar() {
  const { utilizador, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Painel';
  const areaLabel = `CyberBoxSecur — ${AREA_LABELS[utilizador?.perfil] || 'Painel'}`;

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
        <button className="topbar-btn" title="Página Inicial" onClick={() => navigate('/')}>
          <FiHome size={17} />
        </button>

        <div className="topbar-bell">
          <button className="topbar-btn" title="Notificações">
            <FiBell size={17} />
          </button>
          <span className="notif-badge">2</span>
        </div>

        <button className="topbar-btn logout" title="Sair" onClick={handleLogout}>
          <FiLogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
