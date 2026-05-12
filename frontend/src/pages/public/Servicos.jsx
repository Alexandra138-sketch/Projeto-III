import { useNavigate } from 'react-router-dom';
import '../../App.css';
import { FaCrosshairs, FaShieldAlt, FaFileAlt, FaDesktop, FaChalkboardTeacher, FaCloud } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PRIMARY_GRADIENT = 'linear-gradient(90deg, #9810fa 0%, #155dfc 50%, #00b8db 100%)';

const SERVICOS = [
  {
    icon: <FaCrosshairs size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'Testes de Penetração (Pentesting)',
    descricao: 'Simulação de ataques reais para identificar vulnerabilidades na sua infraestrutura antes que os atacantes o façam.',
    nis2: true,
  },
  {
    icon: <FaShieldAlt size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #f6339a 0%, #e60076 100%)',
    titulo: 'Gestão de Incidentes NIS2',
    descricao: 'Resposta rápida a incidentes de segurança com notificação às autoridades dentro dos prazos NIS2 (24h/72h).',
    nis2: true,
  },
  {
    icon: <FaFileAlt size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Auditoria de Conformidade NIS2',
    descricao: 'Avaliação completa do estado de conformidade com a Diretiva NIS2 e elaboração de planos de ação.',
    nis2: true,
  },
  {
    icon: <FaDesktop size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'SIEM & Monitorização Contínua',
    descricao: 'Monitorização contínua de eventos de segurança com correlação avançada de ameaças.',
    nis2: true,
  },
  {
    icon: <FaChalkboardTeacher size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #00b8db 0%, #0092b8 100%)',
    titulo: 'Formação e Consciencialização',
    descricao: 'Programas de formação personalizados para aumentar a maturidade de segurança das suas equipas.',
    nis2: false,
  },
  {
    icon: <FaCloud size={22} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Segurança Cloud & DevSecOps',
    descricao: 'Proteção de ambientes cloud e integração de segurança no ciclo de desenvolvimento de software.',
    nis2: false,
  },
];

export default function Servicos() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── HERO DA PÁGINA ── */}
      <section className="position-relative overflow-hidden text-center" style={{ backgroundColor: '#faf5ff', padding: '80px 0 60px' }}>
        <div className="position-absolute top-0 end-0 rounded-circle" style={{
          width: '500px', height: '500px',
          background: 'linear-gradient(135deg, rgba(194,122,255,0.25) 0%, rgba(81,162,255,0.25) 50%, rgba(0,211,243,0.25) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />
        <div className="container position-relative">
          <h1 className="fw-semibold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#101828' }}>
            Serviços{' '}
            <span style={{ background: 'linear-gradient(90deg, #9810fa 0%, #155dfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Especializados
            </span>
          </h1>
          <p className="mx-auto" style={{ maxWidth: '500px', color: '#4a5565', fontSize: '16px' }}>
            Soluções completas para elevar a segurança e conformidade da sua empresa
          </p>
        </div>
      </section>

      {/* ── CARDS ── */}
      <section className="py-5 bg-white flex-grow-1">
        <div className="container py-3">
          <div className="row g-4 text-start">
            {SERVICOS.map((s) => (
              <div className="col-12 col-md-6 col-lg-4" key={s.titulo}>
                <div className="h-100 position-relative p-4" style={{ border: '1.6px solid rgba(0,0,0,0.1)', borderRadius: '16px', background: '#fff' }}>
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
                  <a href="#" className="d-inline-flex align-items-center gap-1 text-decoration-none small fw-medium" style={{ color: '#9810fa' }}>
                    Saber mais <FiArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <button className="btn-purple-outline">+ Detalhes</button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="position-relative overflow-hidden text-center" style={{ backgroundColor: '#faf5ff', padding: '80px 0' }}>
        <div className="position-absolute top-0 end-0 rounded-circle" style={{
          width: '534px', height: '364px', marginTop: '60px',
          background: 'linear-gradient(34deg, rgba(251,100,182,0.2) 0%, rgba(255,137,4,0.2) 50%, rgba(253,199,0,0.2) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />
        <div className="position-absolute bottom-0 start-0 rounded-circle" style={{
          width: '507px', height: '208px',
          background: 'linear-gradient(158deg, rgba(194,122,255,0.3) 0%, rgba(81,162,255,0.3) 50%, rgba(0,211,243,0.3) 100%)',
          filter: 'blur(64px)', pointerEvents: 'none',
        }} />
        <div className="container position-relative py-4">
          <h2 className="fw-semibold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#101828', lineHeight: 1.2 }}>
            Pronto para Proteger o Seu Negócio?
          </h2>
          <p className="mx-auto mb-5" style={{ maxWidth: '560px', fontSize: '17px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.7 }}>
            Agende uma demonstração gratuita e descubra como a nossa tecnologia pode proteger a sua empresa contra ameaças digitais.
          </p>
          <button onClick={() => navigate('/contacto')} className="btn-gradient">
            Agendar Serviços <FiArrowRight />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
