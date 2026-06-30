import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiBarChart2, FiUsers, FiBriefcase, FiFileText,
  FiAlertTriangle, FiActivity, FiGlobe, FiLogOut, FiShield, FiLayers,
  FiServer, FiMessageSquare,
} from 'react-icons/fi';
import './layout.css';

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Dashboard',           icon: FiGrid,          end: true },
  { to: '/admin/analises',     label: 'Análises & Gráficos', icon: FiBarChart2 },
  { to: '/admin/utilizadores', label: 'Utilizadores',        icon: FiUsers },
  { to: '/admin/clientes',     label: 'Clientes',            icon: FiBriefcase },
  { to: '/admin/documentos',   label: 'Documentos',          icon: FiFileText },
  { to: '/admin/incidentes',   label: 'Incidentes',          icon: FiAlertTriangle },
  { to: '/admin/logs',         label: 'Logs de Atividade',   icon: FiActivity },
  { to: '/admin/conteudo',     label: 'Conteúdo do Site',    icon: FiGlobe },
];

const GESTOR_LINKS = [
  { to: '/gestor',            label: 'Dashboard',           icon: FiGrid,          end: true },
  { to: '/gestor/analises',   label: 'Análises & Gráficos', icon: FiBarChart2 },
  { to: '/gestor/clientes',   label: 'Clientes',            icon: FiBriefcase },
  { to: '/gestor/documentos', label: 'Documentos',          icon: FiFileText },
  { to: '/gestor/incidentes', label: 'Incidentes',          icon: FiAlertTriangle },
];

const EMPRESA_LINKS = [
  { to: '/empresa',            label: 'Dashboard',           icon: FiGrid,          end: true },
  { to: '/empresa/ambiente',   label: 'Ambiente',            icon: FiLayers },
  { to: '/empresa/analises',   label: 'Análises & Gráficos', icon: FiBarChart2 },
  { to: '/empresa/ativos',     label: 'Ativos Tecnológicos', icon: FiServer },
  { to: '/empresa/incidentes', label: 'Incidentes',          icon: FiAlertTriangle },
  { to: '/empresa/documentos', label: 'Os Meus Documentos',  icon: FiFileText },
  { to: '/empresa/pedidos',    label: 'Pedidos & Questões',  icon: FiMessageSquare },
];

const ROLE_LABELS = {
  admin: 'Administrador',
  gestor: 'Gestor',
  empresa: 'Empresa',
};

function Sidebar() {
  const { utilizador, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links =
    utilizador?.perfil === 'admin' ? ADMIN_LINKS :
    utilizador?.perfil === 'gestor' ? GESTOR_LINKS :
    EMPRESA_LINKS;

  const roleLabel = ROLE_LABELS[utilizador?.perfil] || 'Utilizador';
  const initial = utilizador?.nome?.[0]?.toUpperCase() || 'U';

  return (
    <div className="admin-sidebar">
      <a href="/" className="sidebar-brand">
          <img
            src="/img/logo2.png" alt="CyberBoxSecur" style={{ height: '50px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
      </a>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {badge != null && <span className="sidebar-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initial}</div>
        <div className="user-info">
          <p className="user-name">{utilizador?.nome || 'Utilizador'}</p>
          <span className="user-role">{roleLabel}</span>
              </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Sair">
          <FiLogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
