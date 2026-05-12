import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Contacto', to: '/contacto' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark" to="/">
          <FaShieldAlt style={{ color: '#7c3aed', fontSize: '22px' }} />
          <span style={{ fontSize: '15px', color: '#1e1b4b' }}>CyberBoxSecur</span>
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav mx-auto gap-lg-2">
            {NAV_LINKS.map(({ label, to }) => {
              const active = location.pathname === to;
              return (
                <li className="nav-item" key={to}>
                  <Link
                    to={to}
                    className={`nav-link fw-medium ${active ? 'fw-semibold' : 'text-secondary'}`}
                    style={active ? { color: '#7c3aed' } : {}}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => navigate('/login')}
            className="btn text-white fw-semibold rounded-pill px-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            Entrar
          </button>
        </div>
      </div>
    </nav>
  );
}
