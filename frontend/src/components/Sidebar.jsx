import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid, BarChart2, Users, Briefcase, FileText,
  AlertTriangle, Activity, Globe, LogOut, Layers,
} from 'lucide-react';
import './layout.css';

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Dashboard',           icon: LayoutGrid,      end: true },
  { to: '/admin/analises',     label: 'Análises & Gráficos', icon: BarChart2 },
  { to: '/admin/utilizadores', label: 'Utilizadores',        icon: Users },
  { to: '/admin/clientes',     label: 'Clientes',            icon: Briefcase },
  { to: '/admin/documentos',   label: 'Documentos',          icon: FileText },
  { to: '/admin/incidentes',   label: 'Incidentes',          icon: AlertTriangle },
  { to: '/admin/logs',         label: 'Logs de Atividade',   icon: Activity },
  { to: '/admin/conteudo',     label: 'Conteúdo do Site',    icon: Globe },
];

const GESTOR_LINKS = [
  { to: '/gestor',            label: 'Dashboard',           icon: LayoutGrid,      end: true },
  { to: '/gestor/analises',   label: 'Análises & Gráficos', icon: BarChart2 },
  { to: '/gestor/clientes',   label: 'Clientes',            icon: Briefcase },
  { to: '/gestor/documentos', label: 'Documentos',          icon: FileText },
  { to: '/gestor/incidentes', label: 'Incidentes',          icon: AlertTriangle },
];

const EMPRESA_LINKS = [
  { to: '/empresa',            label: 'Dashboard',           icon: LayoutGrid,      end: true },
  { to: '/empresa/ambiente',   label: 'Ambiente',            icon: Layers },
  { to: '/empresa/analises',   label: 'Análises & Gráficos', icon: BarChart2 },
  { to: '/empresa/incidentes', label: 'Incidentes',          icon: AlertTriangle },
  { to: '/empresa/documentos', label: 'Os Meus Documentos',  icon: FileText },
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
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
