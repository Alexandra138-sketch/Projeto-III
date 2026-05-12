import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { utilizador, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linksAdmin = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/utilizadores', label: 'Utilizadores' },
    { to: '/admin/documentos', label: 'Documentos' },
    { to: '/admin/incidentes', label: 'Incidentes' },
  ];

  const linksGestor = [
    { to: '/gestor', label: 'Dashboard' },
    { to: '/gestor/clientes', label: 'Clientes' },
    { to: '/gestor/documentos', label: 'Documentos' },
    { to: '/gestor/incidentes', label: 'Incidentes' },
  ];

  const linksEmpresa = [
    { to: '/empresa', label: 'Dashboard' },
    { to: '/empresa/documentos', label: 'Os Meus Documentos' },
    { to: '/empresa/incidentes', label: 'Incidentes' },
  ];

  const links = utilizador?.perfil === 'admin' ? linksAdmin
              : utilizador?.perfil === 'gestor' ? linksGestor
              : linksEmpresa;

  return (
    <div style={{ width: '220px', minHeight: '100vh', background: '#0f172a', color: 'white', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '2rem', color: '#818cf8' }}>CyberBoxSecur</div>
      <nav style={{ flex: 1 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ display: 'block', padding: '0.6rem 0.8rem', marginBottom: '0.3rem', color: '#cbd5e1', textDecoration: 'none', borderRadius: '6px' }}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{utilizador?.nome}</div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;