import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../App.css';

const PRIMARY_GRADIENT = 'linear-gradient(90deg, #9810fa 0%, #155dfc 50%, #00b8db 100%)';

const SERVICOS = [
  {
    icon: '🎯',
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'Testes de Penetração (Pentesting)',
    descricao: 'Simulação de ataques reais para identificar vulnerabilidades na sua infraestrutura antes que os atacantes o façam.',
    nis2: true,
  },
  {
    icon: '🛡',
    iconBg: 'linear-gradient(135deg, #f6339a 0%, #e60076 100%)',
    titulo: 'Gestão de Incidentes NIS2',
    descricao: 'Resposta rápida a incidentes de segurança com notificação às autoridades dentro dos prazos NIS2 (24h/72h).',
    nis2: true,
  },
  {
    icon: '📄',
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Auditoria de Conformidade NIS2',
    descricao: 'Avaliação completa do estado de conformidade com a Diretiva NIS2 e elaboração de planos de ação.',
    nis2: true,
  },
  {
    icon: '🖥',
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'SIEM & Monitorização Contínua',
    descricao: 'Monitorização contínua de eventos de segurança com correlação avançada de ameaças.',
    nis2: true,
  },
  {
    icon: '📚',
    iconBg: 'linear-gradient(135deg, #00b8db 0%, #0092b8 100%)',
    titulo: 'Formação e Consciencialização',
    descricao: 'Programas de formação personalizados para aumentar a maturidade de segurança das suas equipas.',
    nis2: false,
  },
  {
    icon: '☁',
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Segurança Cloud & DevSecOps',
    descricao: 'Proteção de ambientes cloud e integração de segurança no ciclo de desenvolvimento de software.',
    nis2: false,
  },
];

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="position-relative overflow-hidden text-center"
        style={{ backgroundColor: '#faf5ff', padding: '100px 0 80px' }}
      >
        {/* Blob esquerdo */}
        <div className="position-absolute top-0 start-0 rounded-circle" style={{
          width: '500px', height: '500px', marginTop: '60px', marginLeft: '30px',
          background: 'linear-gradient(45deg, rgba(251,100,182,0.18) 0%, rgba(255,137,4,0.18) 50%, rgba(253,199,0,0.18) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />
        {/* Blob direito */}
        <div className="position-absolute top-0 end-0 rounded-circle" style={{
          width: '600px', height: '600px', marginTop: '80px',
          background: 'linear-gradient(135deg, rgba(194,122,255,0.28) 0%, rgba(81,162,255,0.28) 50%, rgba(0,211,243,0.28) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />

        <div className="container position-relative">
          <h1 className="fw-semibold mb-4" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#101828', lineHeight: 1.15 }}>
            Segurança Digital para um<br />Mundo Conectado
          </h1>
          <p className="mx-auto mb-5" style={{ maxWidth: '580px', fontSize: '18px', color: '#4a5565', lineHeight: 1.7 }}>
            Proteja a sua empresa contra ameaças digitais e garanta
            conformidade com as diretivas europeias de cibersegurança.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button type="button" onClick={() => navigate('/servicos')} className="btn-gradient">
              Explorar Serviços →
            </button>
            <button type="button" onClick={() => navigate('/contacto')} className="btn-outline-custom">
              Agendar Serviços
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section className="py-5 bg-white">
        <div className="container py-4 text-center">
          <h2 className="fw-semibold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#101828' }}>
            Serviços{' '}
            <span style={{ background: 'linear-gradient(90deg, #9810fa 0%, #155dfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Especializados
            </span>
          </h2>
          <p className="mb-5" style={{ color: '#4a5565', fontSize: '17px' }}>
            Soluções completas de cibersegurança adaptadas às necessidades da sua empresa.
          </p>

          <div className="row g-4 text-start">
            {SERVICOS.map((s) => (
              <div className="col-12 col-md-6 col-lg-4" key={s.titulo}>
                <div className="h-100 position-relative p-4" style={{ border: '1.6px solid rgba(0,0,0,0.1)', borderRadius: '16px', background: '#fff', transition: 'box-shadow .2s' }}>
                  {s.nis2 && (
                    <span className="position-absolute" style={{ top: '16px', right: '16px', background: '#f3e8ff', color: '#9810fa', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px' }}>
                      NIS2
                    </span>
                  )}
                  <div className="d-flex align-items-center justify-content-center mb-4" style={{ width: '56px', height: '56px', borderRadius: '16px', background: s.iconBg }}>
                    {s.icon}
                  </div>
                  <h5 className="fw-semibold mb-2" style={{ color: '#101828' }}>{s.titulo}</h5>
                  <p className="small mb-3" style={{ color: '#4a5565', lineHeight: 1.6 }}>{s.descricao}</p>
                  <Link to="/servicos" className="d-inline-flex align-items-center gap-1 text-decoration-none small fw-medium" style={{ color: '#9810fa' }}>
                    Saber mais →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <button onClick={() => navigate('/servicos')} className="btn-purple-outline">
              + Detalhes
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="position-relative overflow-hidden text-center py-5" style={{ backgroundColor: '#faf5ff', padding: '80px 0' }}>
        {/* Blobs */}
        <div className="position-absolute top-0 end-0 rounded-circle" style={{
          width: '534px', height: '364px', marginTop: '80px',
          background: 'linear-gradient(34deg, rgba(251,100,182,0.2) 0%, rgba(255,137,4,0.2) 50%, rgba(253,199,0,0.2) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />
        <div className="position-absolute bottom-0 start-0 rounded-circle" style={{
          width: '507px', height: '208px',
          background: 'linear-gradient(158deg, rgba(194,122,255,0.3) 0%, rgba(81,162,255,0.3) 50%, rgba(0,211,243,0.3) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />

        <div className="container position-relative py-5">
          <h2 className="fw-semibold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#101828', lineHeight: 1.2 }}>
            Pronto para Proteger o Seu Negócio?
          </h2>
          <p className="mx-auto mb-5" style={{ maxWidth: '560px', fontSize: '17px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.7 }}>
            Agende uma demonstração gratuita e descubra como a nossa tecnologia pode proteger a sua empresa contra ameaças digitais.
          </p>
          <button onClick={() => navigate('/contacto')} className="btn-gradient">
            Agendar Serviços →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
