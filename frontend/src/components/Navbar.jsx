import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Contacto', to: '/contacto' },
];

const PERFIL_LABELS = {
  admin: 'Administrador',
  gestor: 'Gestor',
  empresa: 'Empresa',
};

const PERFIL_ROUTES = {
  admin: '/admin',
  gestor: '/gestor',
  empresa: '/empresa',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { utilizador, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" style={{ textDecoration: 'none' }}>
          <img
            src="/img/logo.png"
            alt="CyberBoxSecur"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-lg-1">
            {NAV_LINKS.map(({ label, to }) => {
              const active = location.pathname === to;
              return (
                <li className="nav-item" key={to}>
                  <Link
                    to={to}
                    className="nav-link px-3"
                    style={{
                      fontSize: '14px',
                      fontWeight: active ? '600' : '500',
                      color: active ? '#9810fa' : '#4a5565',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {utilizador ? (
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => navigate(PERFIL_ROUTES[utilizador.perfil] || '/login')}
                className="btn-gradient"
                style={{ padding: '8px 18px' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-outline-custom"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Sair
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-gradient" style={{ padding: '8px 22px' }}>
              Entrar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
