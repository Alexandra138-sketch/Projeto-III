import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Dashboard',           icone: '🏠', end: true },
  { to: '/admin/analises',     label: 'Análises & Gráficos', icone: '📊' },
  { to: '/admin/utilizadores', label: 'Utilizadores',        icone: '👥' },
  { to: '/admin/clientes',     label: 'Clientes',            icone: '💼' },
  { to: '/admin/documentos',   label: 'Documentos',          icone: '📄' },
  { to: '/admin/incidentes',   label: 'Incidentes',          icone: '⚠' },
  { to: '/admin/logs',         label: 'Logs de Atividade',   icone: '📋' },
  { to: '/admin/conteudo',     label: 'Conteúdo do Site',    icone: '🌐' },
];

const GESTOR_LINKS = [
  { to: '/gestor',            label: 'Dashboard',           icone: '🏠', end: true },
  { to: '/gestor/analises',   label: 'Análises & Gráficos', icone: '📊' },
  { to: '/gestor/clientes',   label: 'Clientes',            icone: '💼' },
  { to: '/gestor/documentos', label: 'Documentos',          icone: '📄' },
  { to: '/gestor/incidentes', label: 'Incidentes',          icone: '⚠' },
];

const EMPRESA_LINKS = [
  { to: '/empresa',            label: 'Dashboard',          icone: '🏠', end: true },
  { to: '/empresa/ambiente',   label: 'Ambiente',           icone: '🛡' },
  { to: '/empresa/analises',   label: 'Análises',           icone: '📊' },
  { to: '/empresa/incidentes', label: 'Incidentes',         icone: '⚠' },
  { to: '/empresa/documentos', label: 'Os Meus Documentos', icone: '📄' },
];

const ROLE_LABELS = { admin: 'Administrador', gestor: 'Gestor', empresa: 'Empresa' };

function Sidebar() {
  const { utilizador, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links =
    utilizador?.perfil === 'admin'  ? ADMIN_LINKS  :
    utilizador?.perfil === 'gestor' ? GESTOR_LINKS :
    EMPRESA_LINKS;

  const roleLabel = ROLE_LABELS[utilizador?.perfil] || 'Utilizador';
  const initial = utilizador?.nome?.[0]?.toUpperCase() || 'U';

  return (
    <div className="admin-sidebar">
      <a href="/" className="sidebar-brand">
        <img src="/img/logo2.png" alt="CyberBoxSecur"
          style={{ height: '50px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
      </a>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icone, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: '1rem' }}>{icone}</span>
            <span>{label}</span>
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
          ↩
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
