import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Área Reservada', to: '/login' },
];

const CONTACTO = [
  { icone: '✉', text: 'info@cyberboxsecur.pt' },
  { icone: '📞', text: '+351 210 000 000'      },
  { icone: '📍', text: 'Lisboa, Portugal'       },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#040c22', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="container py-4">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-12 col-lg-4">
            <img src="/img/logo2.png" alt="CyberBoxSecur Logo" style={{ width: '100px', height: 'auto' }} className="mb-2" />
            <p className="small mb-3" style={{ color: '#99a1af', lineHeight: 1.7, maxWidth: '232px', fontSize: '14px' }}>
              Protegendo o seu negócio no mundo digital com soluções avançadas de cibersegurança.
            </p>
            <div className="d-flex gap-3">
              {['in', 'tw', 'fb'].map((s) => (
                <a key={s} href="#" className="d-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none fw-bold"
                  style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #9810fa 0%, #155dfc 100%)', fontSize: '12px' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-3">Links Rápidos</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-decoration-none small" style={{ color: '#d1d5dc', fontSize: '14px' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-3">Contacto</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {CONTACTO.map((c, i) => (
                <li key={i} className="d-flex align-items-center gap-2">
                  <span>{c.icone}</span>
                  <span className="small" style={{ color: '#d1d5dc', fontSize: '14px' }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span className="small" style={{ color: '#99a1af', fontSize: '12px' }}>
            © 2025 CyberBoxSecur. Todos os direitos reservados.
          </span>
          <div className="d-flex gap-4 flex-wrap">
            <a href="#" className="small text-decoration-none" style={{ color: '#99a1af', fontSize: '12px' }}>Política de Privacidade</a>
            <a href="#" className="small text-decoration-none" style={{ color: '#99a1af', fontSize: '12px' }}>Termos de Serviço</a>
            <a href="#" className="small text-decoration-none fw-medium" style={{ color: '#9810fa', fontSize: '12px' }}>NIS2 (UE) 2022/2555</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
