import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLinkedinIn, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const SOCIAL = [
  { icon: <FaLinkedinIn size={16} color="#fff" />, bg: 'linear-gradient(135deg, #9810fa 0%, #155dfc 100%)' },
  { icon: <FaTwitter size={16} color="#fff" />, bg: 'linear-gradient(135deg, #155dfc 0%, #0092b8 100%)' },
  { icon: <FaFacebookF size={16} color="#fff" />, bg: 'linear-gradient(135deg, #0092b8 0%, #9810fa 100%)' },
];

const LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Área Reservada', to: '/login' },
];

const CONTACTO = [
  { icon: <FiMail size={14} />, text: 'info@cyberboxsecur.pt', bg: 'linear-gradient(135deg, #9810fa 0%, #155dfc 100%)' },
  { icon: <FiPhone size={14} />, text: '+351 210 000 000', bg: 'linear-gradient(135deg, #155dfc 0%, #0092b8 100%)' },
  { icon: <FiMapPin size={14} />, text: 'Lisboa, Portugal', bg: 'linear-gradient(135deg, #0092b8 0%, #9810fa 100%)' },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0d0f14', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="container py-5">
        <div className="row g-5">
          {/* Brand */}
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/img/logovariant2.png" alt="CyberBoxSecur Logo" style={{ width: '100px', height: 'auto' }} />
            </div>
            <p className="small mb-4" style={{ color: '#99a1af', lineHeight: 1.7, maxWidth: '232px' }}>
              Protegendo o seu negócio no mundo digital com soluções avançadas de cibersegurança.
            </p>
            <div className="d-flex gap-3">
              {SOCIAL.map((s, i) => (
                <a key={i} href="#" className="d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                  style={{ width: '40px', height: '40px', background: s.bg, flexShrink: 0 }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-4" style={{ fontSize: '17px' }}>Links Rápidos</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-decoration-none small" style={{ color: '#d1d5dc' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-4" style={{ fontSize: '17px' }}>Contacto</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {CONTACTO.map((c, i) => (
                <li key={i} className="d-flex align-items-center gap-3">
                  <span className="d-flex align-items-center justify-content-center rounded-circle text-white flex-shrink-0"
                    style={{ width: '32px', height: '32px', background: c.bg }}>
                    {c.icon}
                  </span>
                  <span className="small" style={{ color: '#d1d5dc' }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span className="small" style={{ color: '#99a1af' }}>
            © 2025 CyberBoxSecur. Todos os direitos reservados.
          </span>
          <div className="d-flex gap-4 flex-wrap">
            <a href="#" className="small text-decoration-none" style={{ color: '#99a1af' }}>Política de Privacidade</a>
            <a href="#" className="small text-decoration-none" style={{ color: '#99a1af' }}>Termos de Serviço</a>
            <a href="#" className="small text-decoration-none fw-medium" style={{ color: '#9810fa' }}>NIS2 (UE) 2022/2555</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
