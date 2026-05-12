import { Link } from 'react-router-dom';
import { FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedinIn, FaTwitter, FaFacebookF } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8' }}>
      {/* Main footer */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaShieldAlt style={{ color: '#7c3aed', fontSize: '22px' }} />
              <span className="fw-bold text-white" style={{ fontSize: '15px' }}>CyberBoxSecur</span>
            </div>
            <p className="small mb-4" style={{ color: '#94a3b8', lineHeight: '1.7' }}>
              Protegendo o seu negócio no mundo digital com soluções avançadas de cibersegurança.
            </p>
            <div className="d-flex gap-2">
              {[
                { icon: <FaLinkedinIn />, href: '#' },
                { icon: <FaTwitter />, href: '#' },
                { icon: <FaFacebookF />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="d-flex align-items-center justify-content-center text-white rounded-circle"
                  style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', textDecoration: 'none', fontSize: '14px' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-3">Links Rápidos</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {[
                { label: 'Início', to: '/' },
                { label: 'Serviços', to: '/servicos' },
                { label: 'Contacto', to: '/contacto' },
                { label: 'Área Reservada', to: '/login' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-decoration-none small" style={{ color: '#94a3b8' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-3">Contacto</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {[
                { icon: <FaEnvelope />, text: 'info@cyberboxsecur.pt' },
                { icon: <FaPhone />, text: '+351 210 000 000' },
                { icon: <FaMapMarkerAlt />, text: 'Lisboa, Portugal' },
              ].map((c, i) => (
                <li key={i} className="d-flex align-items-center gap-3">
                  <span
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', fontSize: '13px' }}
                  >
                    {c.icon}
                  </span>
                  <span className="small" style={{ color: '#94a3b8' }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1e293b' }}>
        <div className="container py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="small" style={{ color: '#64748b' }}>
            © 2025 CyberBoxSecur. Todos os direitos reservados.
          </span>
          <div className="d-flex gap-3 flex-wrap">
            <a href="#" className="small text-decoration-none" style={{ color: '#64748b' }}>Política de Privacidade</a>
            <a href="#" className="small text-decoration-none" style={{ color: '#64748b' }}>Termos de Serviço</a>
            <a href="#" className="small text-decoration-none fw-semibold" style={{ color: '#7c3aed' }}>NIS2 (UE) 2022/2555</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
